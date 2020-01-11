const fs = require('fs');

const inquirer = require('inquirer');

const key_helper = require('./key.js');
const utils_helper = require('./utils_helper.js');

convert_binary = (integer) => integer.toString(2).padStart(8, '0').split('');

binaryArrayToInt = (array_of_array) => {
    let array_of_int = [];
    for (let index = 0; index < array_of_array.length; index += 1) {
        array_of_int[index] = 0;
        for (let i = 0; i < array_of_array[index].length; i += 1) {
            if (array_of_array[index][i]) {
                array_of_int[index] += 2 ** (7 - i);
            }
        }
    }
    return new Uint8Array(array_of_int); // We use Uint8Array beacause it's necesary for writing file with nodejs
}

getFileAsBinary = (path) => {
    const binary_file = [];
    let file = fs.readFileSync(path, (err, data) => {
        if (err) throw err;
    });
    file.forEach((char, i) => {
        binary_file[i] = convert_binary(char);
    });
    return binary_file;
}

compressFile = (file, key, path_to_new_file) => {
    let writeStream = fs.createWriteStream(path_to_new_file);
    file = file.flat().join('');

    let regex = new RegExp('.{1,' + utils_helper.IDENTITY_MATRICE_LENGTH + '}', 'g');
    file = file.match(regex);
    file.forEach((group_of_bits) => {
        tmp = [];
        for (let i = 0; i < utils_helper.LENGTH_REFERENCE; i += 1) {
            tmp[i] = 0;
        }
        for (let j = 0; j < group_of_bits.length; j += 1) {
            if (group_of_bits[j] === '1') {
                for (let k = 0; k < key[j].length; k += 1) {
                    tmp[k] = Number(key[j][k]) + Number(tmp[k]);
                }
            }
        }
        for (let i = 0; i < tmp.length; i += 1) {
            tmp[i] = tmp[i] % 2;
        }
        /**
         * faire le truc de manière sync
         */
        writeStream.write(bi_to_int(tmp), 'binary');
    });
    writeStream.end();
};

bi_to_int = (binary) => {
    let sum = Number();
    for (let i = 0; i < binary.length; i += 1) {
        sum += binary[i] * (2 ** i);
    }
    return new Uint8Array([sum]);
}

makeOctets = (array_of_bit) => {
    let new_array = new Array(Math.ceil(array_of_bit.length / 8));
    for (let i = 0; i < new_array.length; i += 1) {
        new_array[i] = [];
    }
    let compteur_octet = 0;
    let compteur_bit = 0;
    for (let i = 0; i < array_of_bit.length; i += 1) {
        new_array[compteur_octet][compteur_bit] = array_of_bit[i];
        compteur_bit += 1;
        if (compteur_bit >= 8) {
            compteur_bit = 0;
            compteur_octet += 1;
        }
    }
    if (new_array[compteur_octet] != undefined) {
        throw new Error('Taille de clé incorrect');
    }

    return new_array;
}

writeFile = (path, data) => {
    const buffer = Buffer.alloc(data.length, data, 'binary');
    fs.open(path, 'w', function (err, fd) {
        if (err) {
            throw 'error opening file: ' + err;
        }
        // console.log(buffer);
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function () {
                console.log('file written');
            })
        });
    });
}

uncompressFile = (compressed_file, identity_matrice, path_to_new_file) => {
    let result = [];
    let writeStream = fs.createWriteStream(path_to_new_file);
    for (index = 0; index < compressed_file.length; index += utils_helper.LENGTH_REFERENCE) {
        identity_matrice.forEach(number => {
            result.push(Number(compressed_file[index + number]));
        });
        if (result.length % 8 === 0) {
            writeStream.write(bi_to_int(result), 'binary');
            result = [];
        }
    }
    writeStream.end();
}



inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'What do you want to do ?',
    choices: ['chiffrer', 'déchiffer'],
},
]).then(answers_1 => {
    inquirer.prompt([
            {
                name: 'path',
                message: 'what\'s the path to your file ?',
                default:  './image.jpg',
            },
        ]).then(answers_2 => {
            if (answers_1.action == 'chiffrer') { // mode chiffrement
                console.time("chiffrement");
                const key = key_helper.getKey('./key4.txt');
                const file = getFileAsBinary(answers_2.path);
                const compressed_file = compressFile(file, key, answers_2.path + '.cry');
                console.timeEnd("chiffrement");
            } else { // mode déchiffrement
                console.time("déchiffrement");
                const key = key_helper.getKey('./key4.txt');
                const identity_matrice = key_helper.getIidentityMatrice(key);
                console.log(identity_matrice);
                const compressed_file = getFileAsBinary(answers_2.path + '.cry');
                uncompressFile(compressed_file.flat(), identity_matrice, answers_2.path);
                console.timeEnd("déchiffrement");
            }
        });
});
