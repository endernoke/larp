import Phaser from 'phaser';
import { frontendBridge, type PanelId } from '../../bridge/frontendBridge';

function readTilemapProperty<T>(
  object: Phaser.Types.Tilemaps.TiledObject,
  name: string,
): T | undefined {
  return object.properties?.find(
    (property: Record<string, unknown>) => property?.name === name,
  )?.value as T | undefined;
}

interface Interaction {
  locationId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  panel: PanelId;
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: Record<'up' | 'down' | 'left' | 'right' | 'interact', Phaser.Input.Keyboard.Key>;
  private interactions!: Interaction[];
  private nearbyInteraction: Interaction | null = null;
  private prompt!: Phaser.GameObjects.Container;
  private inputBlocked = false;

  constructor() {
    super('world');
  }

  create(): void {
    const map = this.make.tilemap({ key: 'campus-map' });
    const tileset = map.addTilesetImage('campus-tiles', 'campus-tiles');
    if (!tileset) {
      throw new Error('Could not connect to tileset: campus-tiles.');
    }
    const groundLayer = map.createLayer('Ground', tileset);
    const groundDetailsLayer = map.createLayer('GroundDetails', tileset);
    const structuresLayer = map.createLayer('Structures', tileset);
    const abovePlayerLayer = map.createLayer('AbovePlayer', tileset);
    if (!groundLayer || !groundDetailsLayer || !structuresLayer || !abovePlayerLayer) {
      throw new Error('Could not create one or more tilemap layers.');
    }
    groundLayer.setDepth(0);
    groundDetailsLayer.setDepth(1);
    structuresLayer.setDepth(2);
    abovePlayerLayer.setDepth(1_000_000);

    const spawnsLayer = map.getObjectLayer('Spawns');
    const playerSpawnPoint = spawnsLayer?.objects.find((obj) => obj.name === 'player-start');
    if (!playerSpawnPoint
      || playerSpawnPoint.x === undefined
      || playerSpawnPoint.y === undefined
    ) {
      throw new Error('Could not find player spawn point.');
    }
    this.player = this.physics.add.sprite(playerSpawnPoint.x, playerSpawnPoint.y, 'player', 1);
    this.player.setOrigin(0.5, 1);
    this.player.body?.setSize(10, 6).setOffset(3, 17);

    map.setCollisionByProperty({ collides: true }, true, true, structuresLayer as Phaser.Tilemaps.TilemapLayer);
    this.physics.add.collider(this.player, structuresLayer as Phaser.Tilemaps.TilemapLayer);

    const interactionsLayer = map.getObjectLayer('Interactions');
    if (!interactionsLayer) {
      throw new Error('Could not find interactions layer.');
    }
    this.interactions = interactionsLayer.objects.map((obj) => {
      const locationId = readTilemapProperty<string>(obj, 'locationId');
      const label = readTilemapProperty<string>(obj, 'label');
      const panel = readTilemapProperty<PanelId>(obj, 'panel');
      
      if (!locationId || !label || !panel) {
        throw new Error(`Could not read all required properties from interaction object: ${JSON.stringify(obj)}`);
      }

      return {
        locationId,
        label,
        panel,
        x: obj.x ?? 0,
        y: obj.y ?? 0,
        width: obj.width ?? 0,
        height: obj.height ?? 0,
      };
    });

    this.createInput();
    this.createPrompt();

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(4);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.scale.on('resize', (size: Phaser.Structs.Size) => {
      this.prompt.setPosition(size.width / 2, size.height - 55);
    });

    frontendBridge.on(
      'ui:block-input',
      ({ blocked }) => {
        this.inputBlocked = blocked;
      },
    );

    frontendBridge.emit('scene:ready', undefined);
  }

  update(): void {
    const speed = 190;
    let horizontal = 0;
    let vertical = 0;

    if (!this.inputBlocked) {
      if (this.cursors.left.isDown || this.movementKeys.left.isDown) horizontal -= 1;
      if (this.cursors.right.isDown || this.movementKeys.right.isDown) horizontal += 1;
      if (this.cursors.up.isDown || this.movementKeys.up.isDown) vertical -= 1;
      if (this.cursors.down.isDown || this.movementKeys.down.isDown) vertical += 1;
    }

    const direction = new Phaser.Math.Vector2(horizontal, vertical).normalize().scale(speed);
    this.player.setVelocity(direction.x, direction.y);

    this.player.setDepth(this.player.y);

    const nearby = this.interactions.find(
      (interaction) =>
        Phaser.Geom.Rectangle.Contains(
          new Phaser.Geom.Rectangle(
            interaction.x,
            interaction.y,
            interaction.width,
            interaction.height,
          ),
          this.player.x,
          this.player.y,
        ),
    );

    if (nearby !== this.nearbyInteraction) {
      this.nearbyInteraction = nearby ?? null;
      this.prompt.setVisible(Boolean(nearby));
      frontendBridge.emit('location:nearby', { label: nearby?.label ?? null });
    }

    if (this.nearbyInteraction && Phaser.Input.Keyboard.JustDown(this.movementKeys.interact)) {
      frontendBridge.emit('location:interact', {
        locationId: this.nearbyInteraction.locationId,
        panel: this.nearbyInteraction.panel,
      });
    }
  }

  private createInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.movementKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
    }) as Record<'up' | 'down' | 'left' | 'right' | 'interact', Phaser.Input.Keyboard.Key>;
  }

  private createPrompt(): void {
    const background = this.add.rectangle(0, 0, 150, 34, 0x0a100f, 0.92).setStrokeStyle(1, 0xe7ff74);
    const label = this.add
      .text(0, 0, '[ E ]  INTERACT', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#e7ff74',
      })
      .setOrigin(0.5);

    this.prompt = this.add.container(this.scale.width / 2, this.scale.height - 55, [background, label]);
    this.prompt.setScrollFactor(0).setDepth(100).setVisible(false);
  }
}
