import { AbilityComponent } from "./AbilityComponent";
import { CustomAbility } from "CustomAbility/CustomAbility";
import { CustomAbilityInput } from "CustomAbility/CustomAbilityInput";
import { Trigger } from "w3ts";
import { UnitHelper } from "Common/UnitHelper";

export class Channelling implements AbilityComponent, Serializable<Channelling> {

  protected isChannelling: boolean;
  protected cancelChannelTrigger: trigger;

  constructor(
    public name: string = "Channelling",
    public repeatInterval: number = 1,
    public startTick: number = 0,
    public endTick: number = -1,
    public ticksFromEnd: number = 1,
  ) {
    this.isChannelling = false;
    this.cancelChannelTrigger = CreateTrigger();
  }

  forceTerminateAbility(ability: CustomAbility) {
    ability.currentTick = ability.duration - this.ticksFromEnd;
  }
  
  performTickAction(ability: CustomAbility, input: CustomAbilityInput, source: unit) {
    if (!this.isChannelling) {
      this.isChannelling = true;
      DestroyTrigger(this.cancelChannelTrigger);
      this.cancelChannelTrigger = CreateTrigger();

      TriggerRegisterUnitEvent(this.cancelChannelTrigger, input.caster.unit, EVENT_UNIT_SPELL_FINISH);
      TriggerRegisterUnitEvent(this.cancelChannelTrigger, input.caster.unit, EVENT_UNIT_ISSUED_ORDER);
      TriggerRegisterUnitEvent(this.cancelChannelTrigger, input.caster.unit, EVENT_UNIT_ISSUED_POINT_ORDER);
      TriggerRegisterUnitEvent(this.cancelChannelTrigger, input.caster.unit, EVENT_UNIT_ISSUED_TARGET_ORDER);
      TriggerRegisterUnitEvent(this.cancelChannelTrigger, input.caster.unit, EVENT_UNIT_DEATH);
      // TriggerRegisterUnitEvent(this.cancelChannelTrigger, input.caster.unit, EVENT_UNIT_SPELL_CHANNEL);
      // TriggerRegisterUnitEvent(this.cancelChannelTrigger, input.caster.unit, EVENT_UNIT_SPELL_ENDCAST);

      TriggerAddAction(this.cancelChannelTrigger, () => {
        this.forceTerminateAbility(ability);
      })
    }

    if (UnitHelper.isUnitStunned(input.caster.unit)) {
      this.forceTerminateAbility(ability);
    }

    if (ability.isFinishedUsing(this)) {
      this.isChannelling = false;
      DisableTrigger(this.cancelChannelTrigger);
    }
  }
  

  clone(): AbilityComponent {
    return new Channelling(
      this.name, this.repeatInterval, this.startTick, this.endTick, 
      this.ticksFromEnd,
    );
  }
  
  deserialize(
    input: { 
      name: string; 
      repeatInterval: number; 
      startTick: number;
      endTick: number;
      ticksFromEnd: number;
    }
  ) {
    this.name = input.name;
    this.repeatInterval = input.repeatInterval;
    this.startTick = input.startTick;
    this.endTick = input.endTick;
    this.ticksFromEnd = input.ticksFromEnd;
    return this;
  }
}