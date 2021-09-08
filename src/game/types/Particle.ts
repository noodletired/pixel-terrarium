import { Sprite } from 'pixi.js';

import { Controllable, IsControlled } from './Control';
import { Clamp } from './Clamp';
import { Vector } from './Vector';

/**
 * Instruction to control the particle post-collisison test.
 * Undefined does nothing.
 */
export type ParticleCollisionAction = 'kill' | 'constrainY' | 'constrainX' | 'constrainXY' | undefined;

// Support Clamp for getter 't'
const tClamp = new Clamp(0, 1);

// global particle ID tracker
let globalIDTracker = 0;

/**
 * Particle representation, including basic collision checking.
 */
export class Particle
{
	ID: number;
	lifetime: number; // milliseconds
	sprite: Sprite;
	age: number;

	position: Controllable<Vector>;
	velocity: Controllable<Vector>;
	acceleration: Controllable<Vector>;
	scale: Controllable<number>;
	opacity: Controllable<number>;
	rotation: Controllable<number>;
	collisionTest: ((newPosition: Vector, particle: Particle) => ParticleCollisionAction) | null;
	deathAction: ((particle: Particle) => void) | null;

	// percentage age of the particle
	get t(): number
	{
		return tClamp.Apply(this.age / this.lifetime);
	}

	// whether age exceeds lifetime
	get isDead(): boolean
	{
		return this.age >= this.lifetime;
	}

	/**
	 * Construct a new particle with options.
	 * @param options  Particle parameters. Only required params are lifetime and sprite.
	 */
	constructor(options: {
		lifetime: number;
		sprite: Sprite;

		age?: number;
		position?: Controllable<Vector>;
		velocity?: Controllable<Vector>;
		acceleration?: Controllable<Vector>;
		scale?: Controllable<number>;
		opacity?: Controllable<number>;
		rotation?: Controllable<number>;
		collisionTest?: ((newPosition: Vector, particle: Particle) => ParticleCollisionAction);
		deathAction?: ((particle: Particle) => void);
	})
	{
		this.ID = globalIDTracker++;

		this.lifetime = options.lifetime;
		this.sprite = options.sprite;

		this.position = options.position ?? new Vector();
		this.velocity = options.velocity ?? new Vector();
		this.acceleration = options.acceleration ?? new Vector();
		this.scale = options.scale ?? 1;
		this.age = options.age ?? 0;
		this.opacity = options.opacity ?? 1;
		this.rotation = options.rotation ?? 0;

		this.collisionTest = options.collisionTest ?? null;
		this.deathAction = options.deathAction ?? null;
	}

	/**
	 * Updates the particle.
	 * @param dt  Delta time in milliseconds.
	 */
	Update(dt: number): void
	{
		this.age += dt;
		this.UpdatePhysics(dt);

		// Update sprite
		const { sprite } = this;
		sprite.alpha = IsControlled(this.opacity) ? this.opacity(this) : this.opacity;
		sprite.rotation = IsControlled(this.rotation) ? this.rotation(this) : this.rotation;

		const { x, y } = IsControlled(this.position) ? this.position(this) : this.position;
		sprite.x = x;
		sprite.y = y;

		// TODO: fix scaling
		//const scale = IsControlled(this.scale) ? this.scale(t) : this.scale;
		//sprite.scale.x;

		if (this.deathAction && this.isDead)
		{
			this.deathAction(this);
		}
	}

	/**
	 * Simulates physics for the particle.
	 * @param dt  Delta time in milliseconds.
	 */
	UpdatePhysics(dt: number): void
	{
		// Don't process physics if position is being controlled
		if (IsControlled(this.position))
		{
			return;
		}

		// Update velocity
		const acceleration = IsControlled(this.acceleration) ? this.acceleration(this) : this.acceleration.Copy();
		const velocity = IsControlled(this.velocity) ?
			this.velocity(this) :
			this.velocity.Add(acceleration.Multiply(dt));

		// Compute new position without modifying existing vector
		const position = this.position.Copy().Add(velocity.Copy().Multiply(dt));

		if (this.collisionTest)
		{
			switch (this.collisionTest(position, this))
			{
				case 'kill':
					this.age = this.lifetime;
					break;
				case 'constrainX':
					velocity.x = 0;
					position.x = this.position.x;
					break;
				case 'constrainY':
					velocity.y = 0;
					position.y = this.position.y;
					break;
				case 'constrainXY':
					velocity.Set({ x: 0, y: 0 });
					position.Set(this.position);
					break;
				default:
					//do nothing
					break;
			}
		}

		this.position = position;
	}
}