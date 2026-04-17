#!/usr/bin/env sh
# Seq (native): tạo retention xóa mọi event sau 7 ngày. Idempotent nếu đã có policy.
# Cần: seqcli — https://datalust.co/docs/command-line-client
# Biến môi trường: SEQ_SERVER_URL (mặc định http://localhost:5341), SEQ_ADMIN_API_KEY (tùy chọn)

set -eu

SEQ_URL="${SEQ_SERVER_URL:-http://localhost:5341}"
SEQ_URL="${SEQ_URL%/}"

if ! command -v seqcli >/dev/null 2>&1; then
  echo "seqcli not found. Install: dotnet tool install --global seqcli" >&2
  exit 1
fi

i=0
while [ "$i" -lt 60 ]; do
  if curl -fsS "$SEQ_URL/" >/dev/null 2>&1 || wget -qO- "$SEQ_URL/" >/dev/null 2>&1; then
    break
  fi
  i=$((i + 1))
  sleep 2
done
if [ "$i" -eq 60 ]; then
  echo "Seq not reachable at $SEQ_URL" >&2
  exit 1
fi

has_policies() {
  if [ -n "${SEQ_ADMIN_API_KEY:-}" ]; then
    seqcli retention list -s "$SEQ_URL" --json --no-color -a "$SEQ_ADMIN_API_KEY" 2>/dev/null | grep -q '^{'
  else
    seqcli retention list -s "$SEQ_URL" --json --no-color 2>/dev/null | grep -q '^{'
  fi
}

if has_policies; then
  echo "Retention policies already exist; skipping."
  exit 0
fi

if [ -n "${SEQ_ADMIN_API_KEY:-}" ]; then
  seqcli retention create --after 7d --delete-all-events -s "$SEQ_URL" -a "$SEQ_ADMIN_API_KEY"
else
  seqcli retention create --after 7d --delete-all-events -s "$SEQ_URL"
fi

echo "Created retention: delete all events after 7 days."
