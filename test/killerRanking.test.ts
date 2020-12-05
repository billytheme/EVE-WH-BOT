import { expect } from "chai"
import rewire = require("rewire")

let killerRanking = rewire("../src/killerRanking/killerRanking")

describe('killerRanking', function () {
    describe('parseKill', function () {
        it('should not add points if attackers were not in Unchained', function () {
            killerRanking.__with__({
                killerDictionary: {}
            })(function () {
                killerRanking.__get__('parseKill')({ data: JSON.stringify(friendlyVictim) })
                expect(killerRanking.__get__('killerDictionary')).to.be.eql({})
            })
        })
        it('should add points if attackers were in exit and dictionary is empty', function () {
            killerRanking.__with__({
                killerDictionary: {}
            })(function () {
                killerRanking.__get__('parseKill')({ data: JSON.stringify(friendlyAttacker) })
                expect(killerRanking.__get__('killerDictionary')).to.be.eql({ 1: 1, 2: 1 })
            })
        })
        it('should add points if attackers were in exit and dictionary is not empty', function () {
            killerRanking.__with__({
                killerDictionary: { 1: 1, 2: 1 }
            })(function () {
                killerRanking.__get__('parseKill')({ data: JSON.stringify(friendlyAttacker) })
                expect(killerRanking.__get__('killerDictionary')).to.be.eql({ 1: 2, 2: 2 })
            })
        })
        it('should add points to only friendly characters if both friendly and non-friendlies are on the killmail', function () {
            killerRanking.__with__({
                killerDictionary: {}
            })(function () {
                killerRanking.__get__('parseKill')({ data: JSON.stringify(potentialProblemsExample) })
                expect(killerRanking.__get__('killerDictionary')).to.be.eql({
                    707934730: 1,
                    2112655480: 1,
                    137716833: 1,
                    94914644: 1,
                })
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
            corporation_id: 98246668,
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
            "character_id": 1,
            "corporation_id": 705444291,
            "damage_done": 1569,
            "faction_id": 500002,
            "final_blow": false,
            "security_status": -1.6,
            "ship_type_id": 37454,
            "weapon_type_id": 2456
        },
        {
            "alliance_id": 99009511,
            "character_id": 2,
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

let potentialProblemsExample = {
    "attackers": [
        {
            "character_id": 150749844,
            "corporation_id": 1000014,
            "damage_done": 7981,
            "final_blow": false,
            "security_status": -0.9,
            "ship_type_id": 35683,
            "weapon_type_id": 35683
        },
        {
            "alliance_id": 99009511,
            "character_id": 707934730,
            "corporation_id": 98380820,
            "damage_done": 7519,
            "final_blow": true,
            "security_status": 1.4,
            "ship_type_id": 35683,
            "weapon_type_id": 3170
        },
        {
            "character_id": 2113639002,
            "corporation_id": 685333984,
            "damage_done": 5551,
            "final_blow": false,
            "security_status": -1.7,
            "ship_type_id": 35683,
            "weapon_type_id": 35683
        },
        {
            "character_id": 1985391389,
            "corporation_id": 98538590,
            "damage_done": 3768,
            "final_blow": false,
            "security_status": -0.1,
            "ship_type_id": 35683,
            "weapon_type_id": 3170
        },
        {
            "alliance_id": 99009511,
            "character_id": 2112655480,
            "corporation_id": 98380820,
            "damage_done": 2940,
            "final_blow": false,
            "security_status": 4.8,
            "ship_type_id": 35683,
            "weapon_type_id": 35683
        },
        {
            "character_id": 2114252686,
            "corporation_id": 98600522,
            "damage_done": 2055,
            "final_blow": false,
            "security_status": 4.5,
            "ship_type_id": 22456,
            "weapon_type_id": 22456
        },
        {
            "alliance_id": 99009511,
            "character_id": 137716833,
            "corporation_id": 98380820,
            "damage_done": 1864,
            "final_blow": false,
            "security_status": 3.7,
            "ship_type_id": 12044,
            "weapon_type_id": 12044
        },
        {
            "alliance_id": 99009511,
            "character_id": 94914644,
            "corporation_id": 98380820,
            "damage_done": 1844,
            "final_blow": false,
            "security_status": -0.2,
            "ship_type_id": 35683,
            "weapon_type_id": 35683
        },
        {
            "character_id": 91393139,
            "corporation_id": 1000107,
            "damage_done": 1696,
            "final_blow": false,
            "security_status": 3.0,
            "ship_type_id": 34562,
            "weapon_type_id": 34562
        },
        {
            "character_id": 93377130,
            "corporation_id": 98377009,
            "damage_done": 1604,
            "final_blow": false,
            "security_status": 5.0,
            "ship_type_id": 34562,
            "weapon_type_id": 34562
        },
        {
            "character_id": 90185251,
            "corporation_id": 98095549,
            "damage_done": 956,
            "final_blow": false,
            "security_status": 1.4,
            "ship_type_id": 35683,
            "weapon_type_id": 35683
        },
        {
            "alliance_id": 99004734,
            "character_id": 178047070,
            "corporation_id": 98631013,
            "damage_done": 721,
            "final_blow": false,
            "security_status": -0.2,
            "ship_type_id": 35683,
            "weapon_type_id": 35683
        },
        {
            "alliance_id": 1459096720,
            "character_id": 94200257,
            "corporation_id": 1273124967,
            "damage_done": 345,
            "final_blow": false,
            "security_status": 1.8,
            "ship_type_id": 37481,
            "weapon_type_id": 37481
        }
    ],
    "killmail_id": 85360522,
    "killmail_time": "2020-07-04T00:29:21Z",
    "solar_system_id": 30005160,
    "victim": {
        "alliance_id": 99006343,
        "character_id": 2114832910,
        "corporation_id": 98612164,
        "damage_taken": 38844,
        "items": [
            {
                "flag": 87,
                "item_type_id": 2205,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 87,
                "item_type_id": 2205,
                "quantity_dropped": 3,
                "singleton": 0
            },
            {
                "flag": 21,
                "item_type_id": 2281,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 17,
                "item_type_id": 1248,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 22,
                "item_type_id": 10842,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 87,
                "item_type_id": 2446,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 94,
                "item_type_id": 25948,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 9950,
                "quantity_destroyed": 2,
                "singleton": 0
            },
            {
                "flag": 14,
                "item_type_id": 1248,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 11,
                "item_type_id": 1248,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 23,
                "item_type_id": 2281,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 15,
                "item_type_id": 1248,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 87,
                "item_type_id": 2436,
                "quantity_dropped": 2,
                "singleton": 0
            },
            {
                "flag": 12,
                "item_type_id": 1248,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 5,
                "item_type_id": 46002,
                "quantity_dropped": 2,
                "singleton": 0
            },
            {
                "flag": 20,
                "item_type_id": 10842,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 19,
                "item_type_id": 11561,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 87,
                "item_type_id": 15508,
                "quantity_destroyed": 4,
                "singleton": 0
            },
            {
                "flag": 87,
                "item_type_id": 15508,
                "quantity_dropped": 9,
                "singleton": 0
            },
            {
                "flag": 25,
                "item_type_id": 11561,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 16,
                "item_type_id": 1248,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 92,
                "item_type_id": 26086,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 93,
                "item_type_id": 25948,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 24,
                "item_type_id": 2032,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 13,
                "item_type_id": 1248,
                "quantity_destroyed": 1,
                "singleton": 0
            }
        ],
        "position": {
            "x": -1316739924930.172,
            "y": -121081636926.81491,
            "z": 2834604070811.837
        },
        "ship_type_id": 47466
    }
}