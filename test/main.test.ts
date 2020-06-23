import { expect } from "chai"
import rewire = require("rewire")

describe('zKillboardWatcher', function () {
    this.timeout(5000)
    describe('getAllianceName', function () {
        it('should return the correct alliance name for the Alliance ID', async () => {
            let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")
            expect(await zKillboardWatch.__get__('getAllianceName')(99009511)).to.be.equal('Unchained Alliance')
        })
        it('should return None if there is no alliance ID', async () => {
            let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")
            expect(await zKillboardWatch.__get__('getAllianceName')(undefined)).to.be.equal('None')
        })
    })
    describe('getCorporationName', function () {
        it('should return Exit-Strategy', async () => {
            let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")
            expect(await zKillboardWatch.__get__('getCorporationName')(98380820)).to.be.equal('Exit-Strategy')
        })
        it('should return NPC', async () => {
            let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")
            expect(await zKillboardWatch.__get__('getCorporationName')(undefined)).to.be.equal('Unknown')
        })
    })
    describe('getCharacterName', function () {
        it('should return Nosha Izia', async () => {
            let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")
            expect(await zKillboardWatch.__get__('getCharacterName')(2112693921)).to.be.equal('Nosha Izia')
        })
        it('should return NPC', async () => {
            let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")
            expect(await zKillboardWatch.__get__('getCharacterName')(undefined)).to.be.equal('NPC')
        })
    })
    describe('isExitKill', function () {
        it('should return true when a friendly is the victim', function () {
            let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")
            expect(zKillboardWatch.__get__('isFriendlyKill')(friendlyVictim)).to.be.equal(true)
        })
        it('should return true when a friendly is part of the attackers', function () {
            let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")
            expect(zKillboardWatch.__get__('isFriendlyKill')(friendlyAttacker)).to.be.equal(true)
        })
        it('should return false when friendlies is not involved at all', function () {
            let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")
            expect(zKillboardWatch.__get__('isFriendlyKill')(noFriendlies)).to.be.equal(false)
        })
    })
    describe('isKillInChain', function () {
        it('should return 0 when given a kill from deep', function () {
            let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")
            expect(zKillboardWatch.__get__('isKillInChain')(killFromDeep)).to.be.equal(true)
        })
    })
})

describe('pathfinderParse', function () {
    describe('getConnectedSystems', function () {
        it('should return the correct connected systems', function () {
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
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
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
            pathfinderParse.__with__({
                systemDictionary: { 12345: 31002458, 12346: 31001289, 12348: 31000258 },
                wormholeDictionary: { 12347: { source: 12345, target: 12346 } }
            })(function () {
                expect(pathfinderParse.__get__('getJumpsFromHome')(31001289)).to.be.equal(1)
            })
        })
        it('should return the correct number of jumps from home', function () {
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
            pathfinderParse.__with__({
                systemDictionary: { 12345: 31002458, 12346: 31001289, 12348: 31000258 },
                wormholeDictionary: {}
            })(function () {
                expect(pathfinderParse.__get__('getJumpsFromHome')(31002458)).to.be.equal(0)
            })
        })
        it('should return the correct number of jumps from home', function () {
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
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
    describe('getSystemDatabaseIDFromSystemID', function () {
        it('should return the correct number system ID', function () {
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
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
                expect(pathfinderParse.__get__('getSystemDatabaseIDFromSystemID')(31001289)).to.be.equal(12346);
            })
        })
    })
    describe('parseUpdate', function () {
        it('should delete the wormhole connection when given an delete connection update', function () {
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
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
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
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
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
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
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
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
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
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
            let pathfinderParse = rewire("../src/pathfinderParse/pathfinderParse")
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

describe('scannerRanking', function () {
    describe('parseUpdate', function () {
        it('should do nothing if given a EOL Update', function () {
            let scannerRanking = rewire("../src/scannerRanking/scannerRanking")
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
            let scannerRanking = rewire("../src/scannerRanking/scannerRanking")
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
            let scannerRanking = rewire("../src/scannerRanking/scannerRanking")
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
            let scannerRanking = rewire("../src/scannerRanking/scannerRanking")
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
            let scannerRanking = rewire("../src/scannerRanking/scannerRanking")
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

let friendlyVictim = {
    attackers: [
        {
            alliance_id: 99002584,
            character_id: 93879201,
            corporation_id: 98232099,
            damage_done: 309,
            faction_id: 500002,
            final_blow: false,
            security_status: -4.8,
            ship_type_id: 11393,
            weapon_type_id: 11393
        },
        {
            alliance_id: 99002584,
            character_id: 90204495,
            corporation_id: 98232099,
            damage_done: 140,
            faction_id: 500002,
            final_blow: true,
            security_status: -8.8,
            ship_type_id: 33816,
            weapon_type_id: 27387
        }
    ],
    killmail_id: 85048207,
    killmail_time: '2020-06-18T15:04:41Z',
    solar_system_id: 30003068,
    victim: {
        character_id: 2116370696,
        corporation_id: 98640150,
        alliance_id: 99009511,
        damage_taken: 449,
        faction_id: 500001,
        items: [],
        position: {
            x: 2860720487766.9077,
            y: -370135339055.03845,
            z: -4112873812690.3384
        },
        ship_type_id: 670
    },
    zkb: {
        locationID: 50001857,
        hash: 'e26c3a2a4ad6a7da420949299687ad3e6f5865de',
        fittedValue: 10000,
        totalValue: 10000,
        points: 1,
        npc: false,
        solo: false,
        awox: false,
        esi: 'https://esi.evetech.net/latest/killmails/85048207/e26c3a2a4ad6a7da420949299687ad3e6f5865de/',
        url: 'https://zkillboard.com/kill/85048207/'
    }
}

let friendlyAttacker = {
    "attackers": [
        {
            "alliance_id": 99009511,
            "character_id": 2116956417,
            "corporation_id": 705444291,
            "damage_done": 1569,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -1.6,
            "ship_type_id": 37454,
            "weapon_type_id": 2456
        },
        {
            "alliance_id": 1966049571,
            "character_id": 93943937,
            "corporation_id": 98280764,
            "damage_done": 1257,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": 0,
            "ship_type_id": 593,
            "weapon_type_id": 593
        },
        {
            "alliance_id": 1966049571,
            "character_id": 2115667539,
            "corporation_id": 1146145336,
            "damage_done": 992,
            "faction_id": 500002,
            "final_blow": true,
            "security_status": -4.8,
            "ship_type_id": 593,
            "weapon_type_id": 2456
        },
        {
            "character_id": 191010741,
            "corporation_id": 796168111,
            "damage_done": 990,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": 3,
            "ship_type_id": 17812,
            "weapon_type_id": 2456
        },
        {
            "character_id": 95623322,
            "corporation_id": 98602763,
            "damage_done": 703,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": 3.6,
            "ship_type_id": 598,
            "weapon_type_id": 24475
        },
        {
            "alliance_id": 1966049571,
            "character_id": 2116701329,
            "corporation_id": 98568601,
            "damage_done": 630,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -1,
            "ship_type_id": 587,
            "weapon_type_id": 587
        },
        {
            "alliance_id": 1966049571,
            "character_id": 96565296,
            "corporation_id": 1146145336,
            "damage_done": 530,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": 0.6,
            "ship_type_id": 17812,
            "weapon_type_id": 17812
        },
        {
            "alliance_id": 1966049571,
            "character_id": 90989466,
            "corporation_id": 98568601,
            "damage_done": 517,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -2.5,
            "ship_type_id": 593,
            "weapon_type_id": 2488
        },
        {
            "alliance_id": 1966049571,
            "character_id": 93605126,
            "corporation_id": 705444291,
            "damage_done": 155,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -3.6,
            "ship_type_id": 590,
            "weapon_type_id": 2488
        },
        {
            "damage_done": 140,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": 0,
            "ship_type_id": 32913
        },
        {
            "alliance_id": 1966049571,
            "character_id": 93630327,
            "corporation_id": 98280764,
            "damage_done": 110,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -1.8,
            "ship_type_id": 590,
            "weapon_type_id": 2456
        },
        {
            "alliance_id": 1966049571,
            "character_id": 935054296,
            "corporation_id": 98407038,
            "damage_done": 55,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -9.7,
            "ship_type_id": 590,
            "weapon_type_id": 2205
        }
    ],
    "killmail_id": 85056664,
    "killmail_time": "2020-06-18T22:56:27Z",
    "solar_system_id": 31001289,
    "victim": {
        "alliance_id": 99007539,
        "character_id": 91420683,
        "corporation_id": 98008751,
        "damage_taken": 7648,
        "faction_id": 500003,
        "items": [
            {
                "flag": 12,
                "item_type_id": 11309,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 27,
                "item_type_id": 2881,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 29,
                "item_type_id": 12608,
                "quantity_dropped": 71,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 21924,
                "quantity_destroyed": 1148,
                "singleton": 0
            },
            {
                "flag": 14,
                "item_type_id": 1306,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 13,
                "item_type_id": 11309,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 28,
                "item_type_id": 2881,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 11,
                "item_type_id": 11269,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 20,
                "item_type_id": 5973,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 30,
                "item_type_id": 12608,
                "quantity_dropped": 71,
                "singleton": 0
            },
            {
                "flag": 27,
                "item_type_id": 12608,
                "quantity_destroyed": 71,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 21898,
                "quantity_dropped": 727,
                "singleton": 0
            },
            {
                "flag": 94,
                "item_type_id": 30987,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 30,
                "item_type_id": 2881,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 19,
                "item_type_id": 448,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 12608,
                "quantity_destroyed": 919,
                "singleton": 0
            },
            {
                "flag": 93,
                "item_type_id": 30987,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 15,
                "item_type_id": 11229,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 28,
                "item_type_id": 12608,
                "quantity_destroyed": 71,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 12625,
                "quantity_dropped": 724,
                "singleton": 0
            },
            {
                "flag": 29,
                "item_type_id": 2881,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 21906,
                "quantity_dropped": 608,
                "singleton": 0
            },
            {
                "flag": 92,
                "item_type_id": 30987,
                "quantity_destroyed": 1,
                "singleton": 0
            }
        ],
        "position": {
            "x": -144550125488.69952,
            "y": -260509535745.52045,
            "z": -92095114677.82437
        },
        "ship_type_id": 597
    },
    "zkb": {
        "locationID": 40132932,
        "hash": "0ca6c3a7bcabff7c63dff1cb51c3af8075810e20",
        "fittedValue": 2110836.64,
        "totalValue": 10078088.13,
        "points": 1,
        "npc": false,
        "solo": false,
        "awox": false,
        "esi": "https:\/\/esi.evetech.net\/latest\/killmails\/85056664\/0ca6c3a7bcabff7c63dff1cb51c3af8075810e20\/",
        "url": "https:\/\/zkillboard.com\/kill\/85056664\/"
    }
}

let noFriendlies = {
    "attackers": [
        {
            "alliance_id": 1966049571,
            "character_id": 2116956417,
            "corporation_id": 705444291,
            "damage_done": 1569,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -1.6,
            "ship_type_id": 37454,
            "weapon_type_id": 2456
        },
        {
            "alliance_id": 1966049571,
            "character_id": 93943937,
            "corporation_id": 98280764,
            "damage_done": 1257,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": 0,
            "ship_type_id": 593,
            "weapon_type_id": 593
        },
        {
            "alliance_id": 1966049571,
            "character_id": 2115667539,
            "corporation_id": 1146145336,
            "damage_done": 992,
            "faction_id": 500002,
            "final_blow": true,
            "security_status": -4.8,
            "ship_type_id": 593,
            "weapon_type_id": 2456
        },
        {
            "character_id": 191010741,
            "corporation_id": 796168111,
            "damage_done": 990,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": 3,
            "ship_type_id": 17812,
            "weapon_type_id": 2456
        },
        {
            "character_id": 95623322,
            "corporation_id": 98602763,
            "damage_done": 703,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": 3.6,
            "ship_type_id": 598,
            "weapon_type_id": 24475
        },
        {
            "alliance_id": 1966049571,
            "character_id": 2116701329,
            "corporation_id": 98568601,
            "damage_done": 630,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -1,
            "ship_type_id": 587,
            "weapon_type_id": 587
        },
        {
            "alliance_id": 1966049571,
            "character_id": 96565296,
            "corporation_id": 1146145336,
            "damage_done": 530,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": 0.6,
            "ship_type_id": 17812,
            "weapon_type_id": 17812
        },
        {
            "alliance_id": 1966049571,
            "character_id": 90989466,
            "corporation_id": 98568601,
            "damage_done": 517,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -2.5,
            "ship_type_id": 593,
            "weapon_type_id": 2488
        },
        {
            "alliance_id": 1966049571,
            "character_id": 93605126,
            "corporation_id": 705444291,
            "damage_done": 155,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -3.6,
            "ship_type_id": 590,
            "weapon_type_id": 2488
        },
        {
            "damage_done": 140,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": 0,
            "ship_type_id": 32913
        },
        {
            "alliance_id": 1966049571,
            "character_id": 93630327,
            "corporation_id": 98280764,
            "damage_done": 110,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -1.8,
            "ship_type_id": 590,
            "weapon_type_id": 2456
        },
        {
            "alliance_id": 1966049571,
            "character_id": 935054296,
            "corporation_id": 98407038,
            "damage_done": 55,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -9.7,
            "ship_type_id": 590,
            "weapon_type_id": 2205
        }
    ],
    "killmail_id": 85056664,
    "killmail_time": "2020-06-18T22:56:27Z",
    "solar_system_id": 30002082,
    "victim": {
        "alliance_id": 99007539,
        "character_id": 91420683,
        "corporation_id": 98008751,
        "damage_taken": 7648,
        "faction_id": 500003,
        "items": [
            {
                "flag": 12,
                "item_type_id": 11309,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 27,
                "item_type_id": 2881,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 29,
                "item_type_id": 12608,
                "quantity_dropped": 71,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 21924,
                "quantity_destroyed": 1148,
                "singleton": 0
            },
            {
                "flag": 14,
                "item_type_id": 1306,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 13,
                "item_type_id": 11309,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 28,
                "item_type_id": 2881,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 11,
                "item_type_id": 11269,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 20,
                "item_type_id": 5973,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 30,
                "item_type_id": 12608,
                "quantity_dropped": 71,
                "singleton": 0
            },
            {
                "flag": 27,
                "item_type_id": 12608,
                "quantity_destroyed": 71,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 21898,
                "quantity_dropped": 727,
                "singleton": 0
            },
            {
                "flag": 94,
                "item_type_id": 30987,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 30,
                "item_type_id": 2881,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 19,
                "item_type_id": 448,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 12608,
                "quantity_destroyed": 919,
                "singleton": 0
            },
            {
                "flag": 93,
                "item_type_id": 30987,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 15,
                "item_type_id": 11229,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 28,
                "item_type_id": 12608,
                "quantity_destroyed": 71,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 12625,
                "quantity_dropped": 724,
                "singleton": 0
            },
            {
                "flag": 29,
                "item_type_id": 2881,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 21906,
                "quantity_dropped": 608,
                "singleton": 0
            },
            {
                "flag": 92,
                "item_type_id": 30987,
                "quantity_destroyed": 1,
                "singleton": 0
            }
        ],
        "position": {
            "x": -144550125488.69952,
            "y": -260509535745.52045,
            "z": -92095114677.82437
        },
        "ship_type_id": 597
    },
    "zkb": {
        "locationID": 40132932,
        "hash": "0ca6c3a7bcabff7c63dff1cb51c3af8075810e20",
        "fittedValue": 2110836.64,
        "totalValue": 10078088.13,
        "points": 1,
        "npc": false,
        "solo": false,
        "awox": false,
        "esi": "https:\/\/esi.evetech.net\/latest\/killmails\/85056664\/0ca6c3a7bcabff7c63dff1cb51c3af8075810e20\/",
        "url": "https:\/\/zkillboard.com\/kill\/85056664\/"
    }
}

let killFromDeep = {
    "attackers": [
        {
            "damage_done": 883,
            "faction_id": 500021,
            "final_blow": true,
            "security_status": 0,
            "ship_type_id": 30208
        }
    ],
    "killmail_id": 85061635,
    "killmail_time": "2020-06-19T06:33:57Z",
    "solar_system_id": 31002458,
    "victim": {
        "character_id": 95534436,
        "corporation_id": 98548597,
        "damage_taken": 883,
        "items": [
            {
                "flag": 27,
                "item_type_id": 3638,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 19,
                "item_type_id": 21857,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 28,
                "item_type_id": 3651,
                "quantity_destroyed": 1,
                "singleton": 0
            }
        ],
        "position": {
            "x": -125392721503.99855,
            "y": 257725607835.59406,
            "z": -208447684510.52673
        },
        "ship_type_id": 606
    }
}

let deleteWormholeUpdate = {
    title: "Deleted connection 'wh' #12347\n",
    author: "Nosha Izia #2112693921"
}

let deleteSystemUpdate = {
    title: "Deleted system 'J115124' #12345\n",
    author: "Nosha Izia #2112693921"
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