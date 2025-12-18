import { DefaultNamingStrategy } from 'typeorm';

// Oracle Naming Strategy với giới hạn 30 ký tự
export class OracleNamingStrategy extends DefaultNamingStrategy {
    tableName(className: string, customName?: string): string {
        if (customName) return customName;
        // Convert ClassName to BML_TABLE_NAME format
        const snakeCase = className.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `BML_${snakeCase.substring(1).toUpperCase()}`;
    }

    columnName(propertyName: string, customName?: string): string {
        if (customName) return customName;
        // Convert propertyName to COLUMN_NAME format
        const snakeCase = propertyName.replace(/([A-Z])/g, '_$1').toLowerCase();
        return snakeCase.substring(1).toUpperCase();
    }

    // Override để đảm bảo tên không vượt quá 30 ký tự
    indexName(tableOrName: string, columns: string[], where?: string): string {
        const tableName = typeof tableOrName === 'string' ? tableOrName : (tableOrName as any).name;
        const columnNames = columns.join('_');
        const fullName = `IDX_${tableName}_${columnNames}`;

        // Nếu vượt quá 30 ký tự, sử dụng viết tắt
        if (fullName.length > 30) {
            const shortTableName = this.shortenName(tableName);
            const shortColumnNames = columns.map(col => this.shortenName(col)).join('_');
            return `IDX_${shortTableName}_${shortColumnNames}`.substring(0, 30);
        }

        return fullName;
    }

    primaryKeyName(tableOrName: string, columnNames: string[]): string {
        const tableName = typeof tableOrName === 'string' ? tableOrName : (tableOrName as any).name;
        const fullName = `PK_${tableName}`;

        if (fullName.length > 30) {
            const shortTableName = this.shortenName(tableName);
            return `PK_${shortTableName}`.substring(0, 30);
        }

        return fullName;
    }

    uniqueConstraintName(tableOrName: string, columnNames: string[]): string {
        const tableName = typeof tableOrName === 'string' ? tableOrName : (tableOrName as any).name;
        const columnNamesStr = columnNames.join('_');
        const fullName = `UK_${tableName}_${columnNamesStr}`;

        if (fullName.length > 30) {
            const shortTableName = this.shortenName(tableName);
            const shortColumnNames = columnNames.map(col => this.shortenName(col)).join('_');
            return `UK_${shortTableName}_${shortColumnNames}`.substring(0, 30);
        }

        return fullName;
    }

    foreignKeyName(tableOrName: string, columnNames: string[], referencedTablePath?: string, referencedColumnNames?: string[]): string {
        const tableName = typeof tableOrName === 'string' ? tableOrName : (tableOrName as any).name;
        const referencedTableName = referencedTablePath?.split('.').pop();
        const fullName = `FK_${tableName}_${referencedTableName}`;

        if (fullName.length > 30) {
            const shortTableName = this.shortenName(tableName);
            const shortRefTableName = this.shortenName(referencedTableName);
            return `FK_${shortTableName}_${shortRefTableName}`.substring(0, 30);
        }

        return fullName;
    }

    // Helper method để rút gọn tên
    private shortenName(name: string): string {
        const abbreviations: { [key: string]: string } = {
            'USERNAME': 'USR',
            'CREATED_AT': 'CRT_AT',
            'UPDATED_AT': 'UPD_AT',
            'DELETED_AT': 'DEL_AT',
            'FIRST_NAME': 'FST_NM',
            'LAST_NAME': 'LST_NM',
            'PHONE_NUMBER': 'PHN_NUM',
            'DATE_OF_BIRTH': 'DOB',
            'IS_ACTIVE': 'ACTIVE',
            'PASSWORD_HASH': 'PWD_HASH',
            'ORDER_NUMBER': 'ORD_NUM',
            'TOTAL_AMOUNT': 'TOT_AMT',
            'SHIPPING_ADDRESS': 'SHIP_ADDR',
            'PRODUCT_CODE': 'PROD_CD',
            'PRODUCT_NAME': 'PROD_NM',
            'STOCK_QUANTITY': 'STK_QTY',
            'CATEGORY_NAME': 'CAT_NM',
            'PARENT_CATEGORY_ID': 'PARENT_CAT_ID',
            'ORDER_ITEMS': 'ORD_ITEMS',
            'UNIT_PRICE': 'UNIT_PRC',
            'SUBTOTAL': 'SUB_TOT',
        };

        return abbreviations[name] || name.substring(0, 8);
    }
}
