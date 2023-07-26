import * as process from 'process';

type SnowflakeStructure = {
  timestamp?: bigint;
  internalWorkerId?: number;
  internalProcessId?: number;
  increment?: number;
};

class SnowflakeBuilder {
  private _epoch: bigint;
  public constructor(
    epoch: bigint,
  ) {
    this._epoch = epoch;
  }

  public get epoch(): bigint {
    return this._epoch;
  }
  
  public from(snowflake: bigint | string): Snowflake {
    return new Snowflake(this, BigInt(snowflake));
  }

  public make(options?: SnowflakeStructure): Snowflake {
    let value: bigint = 0n;
    if (options !== undefined) {
      if (options.timestamp !== undefined) {
        value |= ((options.timestamp - this._epoch) & 0x3FFFFFFFFFFn) << 22n;
      }
      if (options.internalWorkerId !== undefined) {
        value |= BigInt(options.internalWorkerId & 0x1F) << 17n;
      }
      if (options.internalProcessId !== undefined) {
        value |= BigInt(options.internalProcessId & 0x1F) << 12n;
      }
      if (options.increment !== undefined) {
        value |= BigInt(options.increment & 0xFFF);
      }
    }
    return new Snowflake(this, value);
  }

  public defaultGenerator(internalWorkerId: number): SnowflakeGenerator {
    return new DefaultSnowflakeGenerator(this, internalWorkerId);
  }
}

abstract class SnowflakeGenerator {
  constructor(
    builder: SnowflakeBuilder,
    internalWorkerId: number,
  ) {}
  abstract make(data?: any): Snowflake;
}

class DefaultSnowflakeGenerator extends SnowflakeGenerator {
  private _builder: SnowflakeBuilder;
  private _increment: number;
  private _internalWorkerId: number;
  public constructor(
    builder: SnowflakeBuilder,
    internalWorkerId: number,
  ) {
    super(builder, internalWorkerId);
    this._builder = builder;
    this._increment = 0;
    this._internalWorkerId = internalWorkerId;
  }
  
  public make(_?: any): Snowflake {
    return this._builder.make({
      timestamp: BigInt(Date.now()),
      internalWorkerId: this._internalWorkerId,
      internalProcessId: process.pid,
      increment: this._increment++,
    });
  }
}

class Snowflake {
  private _builder: SnowflakeBuilder;
  private _value: bigint;
  public constructor(
    builder: SnowflakeBuilder,
    value: bigint,
  ) {
    this._builder = builder;
    this._value = value;
  }

  public get builder(): SnowflakeBuilder {
    return this._builder;
  }
  
  public get value(): bigint {
    return this._value;
  }

  public get timestamp(): bigint {
    return (this._value >> 22n) + this._builder.epoch;
  }
  
  public get internalWorkerId(): number {
    return Number((this._value & 0x3E0000n) >> 17n);
  }

  public get internalProcessId(): number {
    return Number((this._value & 0x1F000n) >> 12n);
  }
  
  public get increment(): number {
    return Number(this.value & 0xFFFn);
  }
  
  public set timestamp(newTimestamp: bigint) {
    this._value = (this._value & ~0xFFFFFFFFFFC00000n) | (newTimestamp << 22n);
  }

  public set internalWorkerId(newInternalWorkerId: number) {
    this._value = (this._value & ~0x3E0000n) | (BigInt(newInternalWorkerId) << 17n);
  }

  public set internalProcessId(newInternalProcessId: number) {
    this._value = (this._value & ~0x1F000n) | (BigInt(newInternalProcessId) << 12n);
  }

  public set increment(newIncrement: number) {
    this._value = (this._value & ~0xFFFn) | BigInt(newIncrement);
  }
  
  public get structure(): SnowflakeStructure {
    return {
      timestamp: this.timestamp,
      internalWorkerId: this.internalWorkerId,
      internalProcessId: this.internalProcessId,
      increment: this.increment,
    };
  }
}

const DISCORD_EPOCH: bigint = 1420070400000n;
const ECRD_EPOCH: bigint = 1614070800000n;

const discordBuilder: SnowflakeBuilder =
  new SnowflakeBuilder(DISCORD_EPOCH);  
const ecrdBuilder: SnowflakeBuilder =
  new SnowflakeBuilder(ECRD_EPOCH);

const discordGenerator: SnowflakeGenerator =
  discordBuilder.defaultGenerator(0);

const ecrdGenerator: SnowflakeGenerator =
  ecrdBuilder.defaultGenerator(0);

/*declare let module: any;
module.exports = {
  DISCORD_EPOCH,
  ECRD_EPOCH,
  DefaultSnowflakeGenerator,
  Snowflake,
  SnowflakeBuilder,
  discordBuilder,
  discordGenerator,
  ecrdBuilder,
  ecrdGenerator,
};*/

export {
  DISCORD_EPOCH,
  ECRD_EPOCH,
  DefaultSnowflakeGenerator,
  Snowflake,
  SnowflakeBuilder,
  discordBuilder,
  discordGenerator,
  ecrdBuilder,
  ecrdGenerator,
};
