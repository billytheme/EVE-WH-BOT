import { expect } from "chai"
import rewire = require("rewire")

let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")

describe('pathfinderParse', function () {
    describe('getConnectedSystems', function () {
        it('should return the correct connected systems', function () {
            pathfinderParse.__with__({
                systemDictionary: { 12345: 31002458, 12346: 31001289, 12348: 31000258 },
                wormholeDictionary: { 12347: { source: 12345, target: 12346 } }
            })(function () {
                expect(pathfinderParse.__get__('getConnectedSystems')()).to.be.eql([31002458, 31001289])
            })
        })
    })
    describe('getJumpsFromHome', function () {
        it('should return the correct number of jumps from home', function () {
            pathfinderParse.__with__({
                systemDictionary: { 12345: 31002458, 12346: 31001289, 12348: 31000258 },
                wormholeDictionary: { 12347: { source: 12345, target: 12346 } }
            })(function () {
                expect(pathfinderParse.__get__('getJumpsFromHome')(31001289)).to.be.equal(1)
            })
        })
        it('should return the correct number of jumps from home', function () {
            pathfinderParse.__with__({
                systemDictionary: { 12345: 31002458, 12346: 31001289, 12348: 31000258 },
                wormholeDictionary: {}
            })(function () {
                expect(pathfinderParse.__get__('getJumpsFromHome')(31002458)).to.be.equal(0)
            })
        })
        it('should return the correct number of jumps from home', function () {
            pathfinderParse.__with__({
                systemDictionary: { 12345: 31002458, 12346: 31001289, 12348: 31000258 },
                wormholeDictionary: {
                    12347: { source: 12345, target: 12346 },
                    12349: { source: 12348, target: 12346 }
                }
            })(function () {
                expect(pathfinderParse.__get__('getJumpsFromHome')(31000258)).to.be.equal(2)
            })
        })
    })
    describe('parseUpdate', function () {
        it('should delete the wormhole connection when given an delete connection update', function () {
            pathfinderParse.__with__({
                systemDictionary: {
                    12345: 31002458,
                    12346: 31001289,
                    12348: 31000258
                },
                wormholeDictionary: {
                    12347: { source: 12345, target: 12346 },
                    12349: { source: 12348, target: 12346 }
                }
            })(function () {
                pathfinderParse.__get__('parseUpdate')(deleteWormholeUpdate)
                expect(pathfinderParse.__get__('wormholeDictionary')).to.be.eql({
                    12349: { source: 12348, target: 12346 }
                });
                expect(pathfinderParse.__get__('systemDictionary')).to.be.eql({
                    12345: 31002458,
                    12346: 31001289,
                    12348: 31000258
                });
            })
        })
        it('should delete the system when given an delete system update', function () {
            pathfinderParse.__with__({
                systemDictionary: {
                    12345: 31002458,
                    12346: 31001289,
                    12348: 31000258
                },
                wormholeDictionary: {
                    12347: { source: 12345, target: 12346 },
                    12349: { source: 12348, target: 12346 }
                }
            })(function () {
                pathfinderParse.__get__('parseUpdate')(deleteSystemUpdate)
                expect(pathfinderParse.__get__('wormholeDictionary')).to.be.eql({
                    12349: { source: 12348, target: 12346 },
                    12347: { source: 12345, target: 12346 }
                });
                expect(pathfinderParse.__get__('systemDictionary')).to.be.eql({
                    12346: 31001289,
                    12348: 31000258
                });
            })
        })
        it('should do nothing when given an EOL update', function () {
            pathfinderParse.__with__({
                systemDictionary: {
                    12345: 31002458,
                    12346: 31001289,
                    12348: 31000258
                },
                wormholeDictionary: {
                    12347: { source: 12345, target: 12346 },
                    12349: { source: 12348, target: 12346 }
                }
            })(function () {
                pathfinderParse.__get__('parseUpdate')(EOLUpdate)
                expect(pathfinderParse.__get__('wormholeDictionary')).to.be.eql({
                    12349: { source: 12348, target: 12346 },
                    12347: { source: 12345, target: 12346 }
                });
                expect(pathfinderParse.__get__('systemDictionary')).to.be.eql({
                    12345: 31002458,
                    12346: 31001289,
                    12348: 31000258
                });
            })
        })
        it('should add a wormhole to dict when given a wormhole creation update', function () {
            pathfinderParse.__with__({
                systemDictionary: {
                    12345: 31002458,
                    12346: 31001289,
                    12348: 31000258
                },
                wormholeDictionary: {
                    12347: { source: 12345, target: 12346 }
                }
            })(function () {
                pathfinderParse.__get__('parseUpdate')(wormholeCreationUpdate)
                expect(pathfinderParse.__get__('wormholeDictionary')).to.be.eql({
                    12349: { source: 12348, target: 12346 },
                    12347: { source: 12345, target: 12346 }
                });
                expect(pathfinderParse.__get__('systemDictionary')).to.be.eql({
                    12345: 31002458,
                    12346: 31001289,
                    12348: 31000258
                });
            })
        })
        it('should create a system when given a sytem creation update', function () {
            pathfinderParse.__with__({
                systemDictionary: {
                    12346: 31001289,
                    12348: 31000258
                },
                wormholeDictionary: {
                    12347: { source: 12345, target: 12346 },
                    12349: { source: 12348, target: 12346 }
                }
            })(async function () {
                await pathfinderParse.__get__('parseUpdate')(systemCreationUpdate)
                expect(pathfinderParse.__get__('wormholeDictionary')).to.be.eql({
                    12349: { source: 12348, target: 12346 },
                    12347: { source: 12345, target: 12346 }
                });
                expect(pathfinderParse.__get__('systemDictionary')).to.be.eql({
                    12345: 31002458,
                    12346: 31001289,
                    12348: 31000258
                });
            })
        })
        it('should create a system when given a sytem updated update', function () {
            pathfinderParse.__with__({
                systemDictionary: {
                    12346: 31001289,
                    12348: 31000258
                },
                wormholeDictionary: {
                    12347: { source: 12345, target: 12346 },
                    12349: { source: 12348, target: 12346 }
                }
            })(async function () {
                await pathfinderParse.__get__('parseUpdate')(systemUpdatedCreatedUpdate)
                expect(pathfinderParse.__get__('wormholeDictionary')).to.be.eql({
                    12349: { source: 12348, target: 12346 },
                    12347: { source: 12345, target: 12346 }
                });
                expect(pathfinderParse.__get__('systemDictionary')).to.be.eql({
                    12345: 31002458,
                    12346: 31001289,
                    12348: 31000258
                });
            })
        })
    })
})

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

let systemCreationUpdate = {
    title: "Created system 'J151817' #12345",
    description: "active: NULL ➜ 1",
    author: {name: "Nosha Izia #2112693921"}
}

let systemUpdatedCreatedUpdate = {
    title: "Updated system 'J151817' #12345",
    description: "active: 0 ➜ 1",
    author: {name: "Nosha Izia #2112693921"}
}

let deleteWormholeUpdate = {
    title: "Deleted connection 'wh' #12347\n",
    author: "Nosha Izia #2112693921"
}

let deleteSystemUpdate = {
    title: "Deleted system 'J115124' #12345\n",
    author: "Nosha Izia #2112693921"
}