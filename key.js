const fs = require('fs');
const utils_helper = require('./utils_helper.js');

getKey = (path) => {
    let key = fs.readFileSync(path, 'UTF8', (err, data) => {
        if (err) throw err;
    });
    const regex = /([0,1]*) ?/g;
    key =  key.match(regex);
    // clean array
    let temp = [];
    for (let i of key) {
        if (i && i !== ' ') {
            for (let j in i) {
                if (i[j] === ' ') {
                    i = i.split(' ')[0];
                }
            }
            temp.push(i);
        } 
    }
    key = temp;
    // veriffie que la longeur des chaines est egale
    key.forEach(string => {
        if (string.length !== utils_helper.LENGTH_REFERENCE) {
            throw new Error("Invalid key");
        }
    });
    
    result = [];
    key.forEach((binary_number, index) => {
        result[index] = binary_number.split('');
    });
    return result;
}

getIidentityMatrice = (key) => {
    let identity_matrice = [];
    let i = 0;
    let compteur = 10 ** (utils_helper.IDENTITY_MATRICE_LENGTH - 1);
    while (i < key[0].length) {
        let column_of_matrice = '';
        for (let j = 0; j < utils_helper.IDENTITY_MATRICE_LENGTH; j += 1) {
            column_of_matrice += key[j][i];
        }
        if (column_of_matrice == compteur) {
            compteur = compteur / 10;
            identity_matrice.push(i);
            i = 0;
            continue;
        }
        i += 1;
    } // On cherche la matrice identité
    if (identity_matrice.length !== utils_helper.IDENTITY_MATRICE_LENGTH) {
        throw new Error('erreur matrice identité');
    }
    return identity_matrice;
}

exports.getIidentityMatrice = getIidentityMatrice;
exports.getKey = getKey;