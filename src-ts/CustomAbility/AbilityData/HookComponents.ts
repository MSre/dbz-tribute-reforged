import { BASE } from "./AOEDamageComponents";

export const HookComponents = [
  {
    name: "hook slappy hand", 
    repeatInterval: 1, 
    startTick: 0, 
    endTick: -1,
    damageData: {
      multiplier: BASE.DFIST_EXPLOSION * 1.2,  
      attribute: bj_HEROSTAT_STR, 
      attackType: 6,
      damageType: 0, 
      weaponType: 0, 
    }, 
    maxRange: 1400,
    speed: 50,
    aoe: 180,
    onlyHookHeroes: false,
    useLastCastPoint: true,
    sfxList: [
      {
        model: "SlappyArm.mdl",
        repeatInterval: 1,
        group: 0,
        scale: 3.5,
        startHeight: 75,
        endHeight: 75,
        extraDirectionalYaw: 0,
        color: {
          x: 255,
          y: 255,
          z: 255,
        },
        persistent: true,
        attachmentPoint: "",
      },
      {
        model: "SlappyHand.mdl",
        repeatInterval: 1,
        group: 0,
        scale: 3.7,
        startHeight: 75,
        endHeight: 75,
        extraDirectionalYaw: 0,
        color: {
          x: 255,
          y: 255,
          z: 255,
        },
        persistent: false,
        attachmentPoint: "",
      },
      {
        model: "Abilities\\Spells\\Undead\\DeathCoil\\DeathCoilSpecialArt.mdl",
        repeatInterval: 3,
        group: 0,
        scale: 1,
        startHeight: 25,
        endHeight: 25,
        extraDirectionalYaw: 0,
        color: {
          x: 205,
          y: 255,
          z: 205,
        },
        persistent: false,
        attachmentPoint: "",
      },
    ],
  },
];