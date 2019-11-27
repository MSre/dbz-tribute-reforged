import { CustomPlayer } from "./CustomPlayer";
import { CustomHero } from "CustomHero/CustomHero";
import { Constants } from "Common/Constants";
import { ToolTipOrganizer } from "Common/ToolTipOrganizer";
import { CustomAbilityInput } from "CustomAbility/CustomAbilityInput";
import { CustomAbility } from "CustomAbility/CustomAbility";
import { abilityCodesToNames } from "CustomAbility/AbilityCodesToNames";

// global?
let customPlayers: CustomPlayer[];

export function addAbilityAction(abilityTrigger: trigger, name: string) {
  TriggerAddAction(abilityTrigger, () => {
    const player = GetTriggerPlayer();
    const playerId = GetPlayerId(player);
    // NOTE: do not use GetUnitsSelectedAll(GetTriggerPlayer())
    // it will cause weird selection bugs during multiplayer
    // that is not normally testable via singleplayer

    // const customHero = customPlayers[playerId].getCurrentlySelectedCustomHero();
    for (const customHero of customPlayers[playerId].allHeroes) {
      if (customHero && IsUnitSelected(customHero.unit, player)) {
        customHero.useAbility(
          name,
          new CustomAbilityInput(
            customHero,
            player,
            1,
            customPlayers[playerId].orderPoint,
            customPlayers[playerId].mouseData,
            customPlayers[playerId].targetUnit,
          ),
        );
      }
    }
  });
}

export function addKeyEvent(trigger: trigger, oskey: oskeytype, metaKey: number, keyDown: boolean) {
	for (let i = 0; i < bj_MAX_PLAYERS; ++i) {
    BlzTriggerRegisterPlayerKeyEvent(trigger, Player(i), oskey, metaKey, keyDown);
  }
}

export function setAbilityUIToAbility(
  hero: CustomHero, 
  index: number, 
  tooltipName: string,
  tooltipTitle: string,
  tooltipBody: string,
  iconEnabled: string,
  iconDisabled: string,
) {
  BlzFrameSetTexture(BlzGetFrameByName("MyAbilityIconBar", index), iconEnabled, 0, true);
  BlzFrameSetTexture(BlzGetFrameByName("MyAbilityIconBarBackground", index), iconDisabled, 0, true);
  BlzFrameSetText(BlzGetFrameByName("MyToolTipTextTitle", index), tooltipTitle);
  BlzFrameSetText(BlzGetFrameByName("MyToolTipTextValue", index), tooltipBody);
  ToolTipOrganizer.resizeToolTipHeightByValue(BlzGetFrameByName(tooltipName, index), tooltipBody);
}

export function updateHeroAbilityCD(heroAbility: CustomAbility, index: number, cdText: string, cdValue: number) {
  BlzFrameSetValue(BlzGetFrameByName("MyAbilityIconBar", index), cdValue);
  BlzFrameSetText(BlzGetFrameByName("MyAbilityIconBarText", index), cdText);
}

export function updateSelectedUnitBars(
  unit: unit,
  currentHp: string, 
  maxHp: string, 
  currentMp: string,
  maxMp: string,
  level: string,
) {
  BlzFrameSetValue(BlzGetFrameByName("MyHPBar", 0), GetUnitLifePercent(unit));
  BlzFrameSetValue(BlzGetFrameByName("MyMPBar", 0), GetUnitManaPercent(unit));
  BlzFrameSetValue(BlzGetFrameByName("MyLevelBar", 0), Math.min(100, Math.floor(GetUnitLevel(unit)*0.2)));
  BlzFrameSetText(BlzGetFrameByName("MyHPBarText", 0), currentHp + " / " + maxHp);
  BlzFrameSetText(BlzGetFrameByName("MyMPBarText", 0), currentMp + " / " + maxMp);
  BlzFrameSetText(BlzGetFrameByName("MyLevelBarText", 0), "LVL: " + level);
}

export function CustomPlayerTest() {
  
  customPlayers = [];
  
  for (let i = 0; i < bj_MAX_PLAYERS; ++i) {
    customPlayers[i] = new CustomPlayer(
      i,
      GetPlayerName(Player(i)),
    );
  }

  // need better way to add heroes of player to their hero list
  const addHeroToPlayer = CreateTrigger();
	for (let i = 0; i < bj_MAX_PLAYERS; ++i) {
    TriggerRegisterPlayerSelectionEventBJ(addHeroToPlayer, Player(i), true);
  }
	TriggerAddAction(addHeroToPlayer, () => {
    const addedHero = GetTriggerUnit();
    const player = GetTriggerPlayer();
    const playerId = GetPlayerId(player);
    customPlayers[playerId].addHero(addedHero);
    customPlayers[playerId].selectedUnit = GetTriggerUnit();

    for (let i = 0 ; i < Constants.maxSubAbilities; ++i) {
      let customHero = customPlayers[playerId].getLastSelectedOwnedCustomHero();
      // prevent string table desyncs
      let tooltipName = "abilityButton" + i + "ToolTip";
      if (customHero) {
        let heroAbility = customHero.getAbilityByIndex(i);
        if (heroAbility) {
          let tooltipTitle = heroAbility.tooltip.title;
          let tooltipBody = heroAbility.tooltip.body;
          let iconEnabled = heroAbility.icon.enabled;
          let iconDisabled = heroAbility.icon.disabled;
          // BJDebugMsg(tooltipName + " " + tooltipTitle + " " + tooltipBody + " " + iconEnabled + " " + iconDisabled);
          
          // register abilities to UI frames
          if (GetTriggerPlayer() == GetLocalPlayer()) {
            setAbilityUIToAbility(
              customHero, 
              i, 
              tooltipName, 
              tooltipTitle, 
              tooltipBody, 
              iconEnabled, 
              iconDisabled
            );
          }
        }
      }
    }
	});
  

  // update mouse positions for now
  // might be a bit laggy?
  const updatePlayerMouseData = CreateTrigger();
	for (let i = 0; i < bj_MAX_PLAYERS; ++i) {
    TriggerRegisterPlayerMouseEventBJ(updatePlayerMouseData, Player(i), bj_MOUSEEVENTTYPE_MOVE);
	}
	TriggerAddAction(updatePlayerMouseData, () => {
    const player = GetTriggerPlayer();
    const playerId = GetPlayerId(player);
    if (GetPlayerSlotState(player) == PLAYER_SLOT_STATE_PLAYING) {
      const x = BlzGetTriggerPlayerMouseX();
      const y = BlzGetTriggerPlayerMouseY();
      if (x != 0 && y != 0) {
        customPlayers[playerId].mouseData.x = x;
        customPlayers[playerId].mouseData.y = y;
      }
    }
  });


  const updatePlayerOrderPoint = CreateTrigger();
	for (let i = 0; i < bj_MAX_PLAYERS; ++i) {
    TriggerRegisterPlayerUnitEventSimple(updatePlayerOrderPoint, Player(i), EVENT_PLAYER_UNIT_ISSUED_POINT_ORDER);
  }
  TriggerAddCondition(updatePlayerOrderPoint, Condition(() => {
    return GetPlayerSlotState(GetTriggerPlayer()) == PLAYER_SLOT_STATE_PLAYING;
  }));
  TriggerAddAction(updatePlayerOrderPoint, () => {
    const x = GetOrderPointX();
    const y = GetOrderPointY();
    if (x != 0 && y != 0) {
      const playerId = GetPlayerId(GetTriggerPlayer());
      customPlayers[playerId].orderPoint.x = x;
      customPlayers[playerId].orderPoint.y = y;
    }
  });

  const updatePlayerTargetPoint = CreateTrigger();
	for (let i = 0; i < bj_MAX_PLAYERS; ++i) {
    TriggerRegisterPlayerUnitEventSimple(updatePlayerTargetPoint, Player(i), EVENT_PLAYER_UNIT_ISSUED_TARGET_ORDER);
  }
  TriggerAddCondition(updatePlayerOrderPoint, Condition(() => {
    return GetPlayerSlotState(GetTriggerPlayer()) == PLAYER_SLOT_STATE_PLAYING;
  }));
  TriggerAddAction(updatePlayerTargetPoint, () => {
    const playerId = GetPlayerId(GetTriggerPlayer());
    customPlayers[playerId].targetUnit = GetOrderTargetUnit();
    customPlayers[playerId].orderPoint.x = GetUnitX(customPlayers[playerId].targetUnit);
    customPlayers[playerId].orderPoint.y = GetUnitY(customPlayers[playerId].targetUnit);
  });

  const linkNormalAbilityToCustomAbility = CreateTrigger();
	for (let i = 0; i < bj_MAX_PLAYERS; ++i) {
    TriggerRegisterPlayerUnitEventSimple(linkNormalAbilityToCustomAbility, Player(i), EVENT_PLAYER_UNIT_SPELL_EFFECT);
  }
  TriggerAddAction(linkNormalAbilityToCustomAbility, () => {
    const player = GetTriggerPlayer();
    const playerId = GetPlayerId(player);
    const abilityId = GetSpellAbilityId();

    const spellName = abilityCodesToNames.get(abilityId);

    if (spellName) {
      const caster = GetTriggerUnit();
      const abilityLevel = GetUnitAbilityLevel(caster, abilityId);
      const customHero = customPlayers[playerId].getCurrentlySelectedCustomHero();
      if (customHero && IsUnitSelected(customHero.unit, player)) {
        customHero.useAbility(
          spellName,
          new CustomAbilityInput(
            customHero,
            player,
            abilityLevel,
            customPlayers[playerId].orderPoint,
            customPlayers[playerId].mouseData,
            customPlayers[playerId].targetUnit,
          ),
        );
      }
    }

  });

  
  // zanzo activation trigger
  // tied to z for now
  const abil0 = CreateTrigger();
  BlzTriggerRegisterFrameEvent(abil0, BlzGetFrameByName("abilityButton0", 0), FRAMEEVENT_CONTROL_CLICK);
  // replace key events with more organized method of key reading
  addKeyEvent(abil0, OSKEY_Z, 0, true);
  addAbilityAction(abil0, "Zanzo Dash");

  const abil1 = CreateTrigger();
  BlzTriggerRegisterFrameEvent(abil1, BlzGetFrameByName("abilityButton1", 1), FRAMEEVENT_CONTROL_CLICK);
  addKeyEvent(abil1, OSKEY_X, 0, true);
  addAbilityAction(abil1, "Guard");


  /*
  const abil2 = CreateTrigger();
  BlzTriggerRegisterFrameEvent(abil2, BlzGetFrameByName("abilityButton2", 2), FRAMEEVENT_CONTROL_CLICK);
  addKeyEvent(abil2, OSKEY_Q, 0, true);
  addAbilityAction(abil2, "Energy Punch");

  const abil3 = CreateTrigger();
  BlzTriggerRegisterFrameEvent(abil3, BlzGetFrameByName("abilityButton3", 3), FRAMEEVENT_CONTROL_CLICK);
  addKeyEvent(abil3, OSKEY_W, 0, true);
  addAbilityAction(abil3, "Power Level Rising");

  const abil4 = CreateTrigger();
  BlzTriggerRegisterFrameEvent(abil4, BlzGetFrameByName("abilityButton4", 4), FRAMEEVENT_CONTROL_CLICK);
  addKeyEvent(abil4, OSKEY_E, 0, true);
  addAbilityAction(abil4, "Planet Crusher");

  const abil5 = CreateTrigger();
  BlzTriggerRegisterFrameEvent(abil5, BlzGetFrameByName("abilityButton5", 5), FRAMEEVENT_CONTROL_CLICK);
  addKeyEvent(abil5, OSKEY_R, 0, true);
  addAbilityAction(abil5, "Gigantic Roar");

  const abil6 = CreateTrigger();
  BlzTriggerRegisterFrameEvent(abil6, BlzGetFrameByName("abilityButton6", 6), FRAMEEVENT_CONTROL_CLICK);
  addKeyEvent(abil6, OSKEY_D, 0, true);
  addAbilityAction(abil6, "Gigantic Omegastorm");

  const abil7 = CreateTrigger();
  BlzTriggerRegisterFrameEvent(abil7, BlzGetFrameByName("abilityButton7", 7), FRAMEEVENT_CONTROL_CLICK);
  addKeyEvent(abil7, OSKEY_F, 0, true);
  addAbilityAction(abil7, "Big Bang Kamehameha");

  const abil8 = CreateTrigger();
  BlzTriggerRegisterFrameEvent(abil8, BlzGetFrameByName("abilityButton8", 8), FRAMEEVENT_CONTROL_CLICK);
  addKeyEvent(abil8, OSKEY_C, 0, true);
  addAbilityAction(abil8, "Spirit Bomb");

  const abil9 = CreateTrigger();
  BlzTriggerRegisterFrameEvent(abil9, BlzGetFrameByName("abilityButton9", 9), FRAMEEVENT_CONTROL_CLICK);
  addKeyEvent(abil9, OSKEY_V, 0, true);
  addAbilityAction(abil9, "Dragon Fist");
  */


  // update hp/mp bars for current custom player
	TimerStart(CreateTimer(), 0.03, true, () => {
    for (let i = 0; i < bj_MAX_PLAYERS; ++i) {
      let playerId = i;
      let unit = customPlayers[playerId].selectedUnit;

      if (unit) {
        // make sure strings dont desync
        const currentHp = I2S(Math.max(0, R2I(GetUnitState(unit, UNIT_STATE_LIFE))));
        const maxHp = I2S(BlzGetUnitMaxHP(unit));
        const currentMp = I2S(Math.max(0, R2I(GetUnitState(unit, UNIT_STATE_MANA))));
        const maxMp = I2S(BlzGetUnitMaxMana(unit));
        const level = I2S(GetUnitLevel(unit));

        if (GetPlayerId(GetLocalPlayer()) == playerId) {
          updateSelectedUnitBars(unit, currentHp, maxHp, currentMp, maxMp, level);
        }
      }

      // make sure strings dont desync
      let ownedHero = customPlayers[playerId].getLastSelectedOwnedCustomHero();
      if (ownedHero) {
        for (let j = 0; j < Constants.maxSubAbilities; ++j) {
          let heroAbility = ownedHero.getAbilityByIndex(j);
          if (heroAbility) {
            let cdText = "";
            let abilityCd = heroAbility.currentCd;
            if (abilityCd > 0) {
              cdText = R2SW(abilityCd,2,2) + "s";
            }
            // BJDebugMsg(cdText);
            if (GetPlayerId(GetLocalPlayer()) == playerId) {
              // POSSIBLY LAGGY
              // might be a bit slow having to constantly update text and icon, but we'll see
              let cdValue = 100 * (1 - heroAbility.currentCd / heroAbility.maxCd);
              updateHeroAbilityCD(heroAbility, j, cdText, cdValue);
            }
          }
        }
      }
    }
  });


  // revive heroes for free
  const revoiveSpam = CreateTrigger();
  TriggerRegisterAnyUnitEventBJ(revoiveSpam, EVENT_PLAYER_UNIT_DEATH);
  TriggerAddAction(revoiveSpam, () => {
    const dead = GetTriggerUnit();
    if (IsUnitType(dead, UNIT_TYPE_HERO)) {
      TimerStart(CreateTimer(), 5.0, false, () => {
        const t = GetExpiredTimer();
        ReviveHero(dead, 64 + Math.random()*256, 64 + Math.random()*256, true);
        BJDebugMsg("revoive spam");
        SetUnitState(dead, UNIT_STATE_MANA, BlzGetUnitMaxMana(dead));
        SetUnitState(dead, UNIT_STATE_LIFE, BlzGetUnitMaxHP(dead));
        DestroyTimer(t);
      })
    }
  })
}