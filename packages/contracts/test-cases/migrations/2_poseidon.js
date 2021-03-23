const path = require("path");
/*
 * semaphorejs - Zero-knowledge signaling on Ethereum
 * Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
 *
 * This file is part of semaphorejs.
 *
 * semaphorejs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * semaphorejs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with semaphorejs.  If not, see <http://www.gnu.org/licenses/>.
 */

const poseidonGenContract = require("circomlib/src/poseidon_gencontract.js");
const Artifactor = require("@truffle/artifactor");

module.exports = function migration(deployer) {
  return deployer.then(async () => {
    const contractsDir = path.join(__dirname, "../../build/contracts");
    const artifactor = new Artifactor(contractsDir);
    // Deploy poseidon with a specific number of args
    const deployX = async x => {
      const poseidonX = args => `Poseidon${args}`;
      await artifactor.save({
        contractName: poseidonX(x),
        abi: poseidonGenContract.generateABI(x),
        unlinked_binary: poseidonGenContract.createCode(x)
      });
      await deployer.deploy(artifacts.require(poseidonX(x)));
    };
    await deployX(2);
    await deployX(3);
    await deployX(4);
  });
};
