const fs = require('fs');

const inquirer = require('inquirer');

const key_helper = require('./key.js');
const utils_helper = require('./utils_helper.js');

convert_binary = (integer) => integer.toString(2).padStart(8, '0');

binary_to_int = (binary) => {
	let sum = Number();
	for (let i = 0; i < binary.length; i += 1) {
		sum += binary[i] * 2 ** i;
	}
	return new Uint8Array([ sum ]);
};

init_array = (nb_of_element) => {
	result = [];
	for (let i = 0; i < nb_of_element; i += 1) {
		result[i] = 0;
	}
	return result;
};

NewCompressFile = (path, key) => {
	let readStream = fs.createReadStream(path, { encoding: null });
	let writeStream = fs.createWriteStream(path + '.cry', { encoding: null });
	let buffer;

	readStream.on('readable', () => {
		buffer = readStream.read();
		if (buffer !== null) {
			buffer.forEach((integer) => {
				let binary_string = convert_binary(integer);
				let regex = new RegExp('.{1,' + utils_helper.IDENTITY_MATRICE_LENGTH + '}', 'g');
				binary_string = binary_string.match(regex);
				binary_string.forEach((group_of_bits) => {
					let result = init_array(utils_helper.LENGTH_REFERENCE);
					for (let i = 0; i < group_of_bits.length; i += 1) {
						if (group_of_bits[i] === '1') {
							for (let j = 0; j < key[i].length; j += 1) {
								if (key[i][j] === '1') {
									if (result[j] === 1) {
										result[j] = 0;
									} else {
										result[j] = 1;
									}
								}
							}
						}
					}
					writeStream.write(binary_to_int(result.reverse()));
				});
			});
		}
	});

	readStream.on('end', () => {
		console.log('end of reading');
	});
	writeStream.on('end', () => {
		console.log('end of writing');
	});
};

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
	for (let i = 0; i < new_array.length; i += 1) {
		new_array[i] = binary_to_int(new_array[i].reverse());
	}
	return new Uint8Array(new_array);
};

unCompressFile = (path, identity_matrice) => {
	let readStream = fs.createReadStream(path + '.cry', { encoding: null });
	let writeStream = fs.createWriteStream(path, { encoding: null });
	let buffer;
	let result = [];
	readStream.on('readable', () => {
		buffer = readStream.read();
		let binary_array_of_string = [];
		if (buffer !== null) {
			buffer.forEach((integer) => {
				binary_array_of_string += convert_binary(integer);
			});
			for (index = 0; index < binary_array_of_string.length; index += utils_helper.LENGTH_REFERENCE) {
				identity_matrice.forEach((number) => {
					result.push(Number(binary_array_of_string[index + number]));
				});
			}
			const results = makeOctets(result);
			writeStream.write(results);
		}
	});
	readStream.on('end', () => {
		console.log('end of reading');
	});
	writeStream.on('end', () => {
		console.log('end of writing');
	});
};

inquirer
	.prompt([
		{
			type: 'list',
			name: 'action',
			message: 'What do you want to do ?',
			choices: [ 'chiffrer', 'déchiffer' ]
		}
	])
	.then((answers_1) => {
		inquirer
			.prompt([
				{
					name: 'path',
					message: "what's the path to your file ?",
					default: './test.txt'
				}
			])
			.then((answers_2) => {
				if (answers_1.action == 'chiffrer') {
					// mode chiffrement
					console.time('chiffrement');
					const key = key_helper.getKey('./key4.txt');
					NewCompressFile(answers_2.path, key);
					console.timeEnd('chiffrement');
				} else {
					// mode déchiffrement
					console.time('déchiffrement');
					const key = key_helper.getKey('./key4.txt');
					const identity_matrice = key_helper.getIidentityMatrice(key);
					unCompressFile(answers_2.path, identity_matrice);
					console.timeEnd('déchiffrement');
				}
			});
	});
