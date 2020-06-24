import { expect } from "chai"
import rewire = require("rewire")

let scannerRanking = rewire("../src/scannerRanking/scannerRanking")

describe('scannerRanking', function () {
    describe('parseUpdate', function () {
        it('should do nothing if given a EOL Update', function () {
            scannerRanking.__with__({
                scannerDictionary: {
                    2112693921: 4,
                    93837168: 5
                }
            })(function () {
                scannerRanking.__get__('parseUpdate')(EOLUpdate)
                expect(scannerRanking.__get__('scannerDictionary')).to.be.eql({
                    2112693921: 4,
                    93837168: 5
                });
            })
        })
        it('should not add points if given a ore site created update', function () {
            scannerRanking.__with__({
                scannerDictionary: {
                    2112693921: 4,
                    93837168: 5
                }
            })(function () {
                scannerRanking.__get__('parseUpdate')(oreAnomalyCreatedUpdate)
                expect(scannerRanking.__get__('scannerDictionary')).to.be.eql({
                    2112693921: 4,
                    93837168: 5
                });
            })
        })
        it('should add points if given a wormhole creation update', function () {
            scannerRanking.__with__({
                scannerDictionary: {
                    2112693921: 4,
                    93837168: 5
                }
            })(function () {
                scannerRanking.__get__('parseUpdate')(wormholeCreationUpdate)
                expect(scannerRanking.__get__('scannerDictionary')).to.be.eql({
                    2112693921: 5,
                    93837168: 5
                });
            })
        })
        it('should add points if given a generic signature creation update', function () {
            scannerRanking.__with__({
                scannerDictionary: {
                    2112693921: 4,
                    93837168: 5
                }
            })(function () {
                scannerRanking.__get__('parseUpdate')(gasAnomalyCreatedUpdate)
                expect(scannerRanking.__get__('scannerDictionary')).to.be.eql({
                    2112693921: 5,
                    93837168: 5
                });
            })
        })
        it('should not add points if given a combat anomaly', function () {
            scannerRanking.__with__({
                scannerDictionary: {
                    2112693921: 4,
                    93837168: 5
                }
            })(function () {
                scannerRanking.__get__('parseUpdate')(combatAnomalyCreatedUpdate)
                expect(scannerRanking.__get__('scannerDictionary')).to.be.eql({
                    2112693921: 4,
                    93837168: 5
                });
            })
        })
    })
})


let oreAnomalyCreatedUpdate = {
    title: "Created signature 'JUK-150' #446581",
    description: "groupId: NULL ➜ 1 , typeId: NULL ➜ 19 , name: NULL ➜ 'JUK-150' , description: NULL ➜ ' '",
    author: {name: "Nosha Izia #2112693921"}
}

let gasAnomalyCreatedUpdate = {
    title: "Created signature 'JUK-150' #446581",
    description: "groupId: NULL ➜ 2 , typeId: NULL ➜ 19 , name: NULL ➜ 'JUK-150' , description: NULL ➜ ' '",
    author: {name: "Nosha Izia #2112693921"}
}

let combatAnomalyCreatedUpdate = {
    title: "Created signature 'JUK-150' #446581",
    description: "groupId: NULL ➜ 6 , typeId: NULL ➜ 19 , name: NULL ➜ 'JUK-150' , description: NULL ➜ ' '",
    author: {name: "Nosha Izia #2112693921"}
}

let EOLUpdate = {
    title: "Updated connection 'wh' #12349\n",
    description: "type: '[\"wh_fresh\"]' ➜ '[\"wh_fresh\",\"wh_jump_mass_xl\"]'",
    author: {name: "Nosha Izia #2112693921"}
}

let wormholeCreationUpdate = {
    title: "Created connection 'wh' #12349",
    description: "source: NULL ➜ 12348 , target: NULL ➜ 12346 , scope: NULL ➜ 'wh' , type: NULL ➜ '[\"wh_fresh\"]'",
    author: {name: "Nosha Izia #2112693921"}
}