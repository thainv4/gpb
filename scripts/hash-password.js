const bcrypt = require('bcrypt');

async function hashPassword() {
    const password = 'Admin123!';
    const saltRounds = 12;

    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Password:', password);
        console.log('Hash:', hash);

        // Verify the hash
        const isValid = await bcrypt.compare(password, hash);
        console.log('Hash is valid:', isValid);

        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    hashPassword()
        .then(hash => {
            console.log('\n=== COPY THIS HASH TO SQL SCRIPT ===');
            console.log(hash);
        })
        .catch(console.error);
}

module.exports = { hashPassword };
