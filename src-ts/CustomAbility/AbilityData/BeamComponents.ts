export const BeamComponents = [
  // copy from here
  { 
    name: "beam kamehameha",
    repeatInterval: 1,
    beamHpMult: 0.1,
    beamHpAttribute: bj_HEROSTAT_INT,
    speed: 30,
    aoe: 300,
    clashingDelayTicks: 1,
    maxDelayTicks: 6,
    durationIncPerDelay: 12,
    heightVariation: {
      start: 100,
      finish: 100,
      scaling: 0,
    },
    isTracking: false,
    isFixedAngle: false,
    canClashWithHero: true,
    beamUnitType: "hpea",
    components: [
      { name: "damage 1tick 0.05int 300aoe" },
      { name: "damage final 5int 400aoe" },
      { name: "knockback 1tick 10speed 0angle 250aoe" },
      { name: "sfx kamehameha" },
    ],
  },
  // to here, and replace with unique name
  { 
    name: "beam spirit bomb",
    repeatInterval: 1,
    beamHpMult: 0.2,
    beamHpAttribute: bj_HEROSTAT_INT,
    speed: 25,
    aoe: 300,
    clashingDelayTicks: 2,
    maxDelayTicks: 10,
    durationIncPerDelay: 15,
    heightVariation: {
      start: 600,
      finish: 0,
      scaling: 1,
    },
    isTracking: false,
    isFixedAngle: false,
    canClashWithHero: true,
    beamUnitType: "hpea",
    components: [
      { name: "damage 1tick 0.1int 400aoe" },
      { name: "damage final 10int 500aoe" },
      { name: "knockback 1tick 15speed 0angle 300aoe" },
      { name: "sfx beam spirit bomb" },
    ],
  },
  // -------------------------------------------
  { 
    name: "beam homing kamehameha",
    repeatInterval: 1,
    beamHpMult: 0.5,
    beamHpAttribute: bj_HEROSTAT_INT,
    speed: 25,
    aoe: 250,
    clashingDelayTicks: 1,
    maxDelayTicks: 6,
    durationIncPerDelay: 12,
    heightVariation: {
      start: 75,
      finish: 75,
      scaling: 0,
    },
    isTracking: false,
    isFixedAngle: false,
    canClashWithHero: true,
    beamUnitType: "hpea",
    components: [
      { name: "damage 1tick 0.5int 250aoe" },
      { name: "damage final 5int 300aoe" },
      { name: "sfx kamehameha" },
      { name: "dodge homing beam" },
    ],
  },
  // -------------------------------------------
];