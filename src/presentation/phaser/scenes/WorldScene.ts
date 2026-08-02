import Phaser from 'phaser';
import { frontendBridge, type PanelId } from '../../bridge/frontendBridge';

interface Hotspot {
  locationId: string;
  label: string;
  panel: PanelId;
  x: number;
  y: number;
  color: number;
}

const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 820;

const HOTSPOTS: Hotspot[] = [
  {
    locationId: 'campus-terminal',
    label: 'Campus terminal',
    panel: 'phone',
    x: 250,
    y: 325,
    color: 0x61d7c5,
  },
  {
    locationId: 'library-desk',
    label: 'Weekly planning desk',
    panel: 'planner',
    x: 830,
    y: 335,
    color: 0xe7ff74,
  },
  {
    locationId: 'career-centre',
    label: 'Career centre kiosk',
    panel: 'resume',
    x: 1010,
    y: 485,
    color: 0xff946b,
  },
];

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: Record<'up' | 'down' | 'left' | 'right' | 'interact', Phaser.Input.Keyboard.Key>;
  private nearbyHotspot: Hotspot | null = null;
  private prompt!: Phaser.GameObjects.Container;

  constructor() {
    super('world');
  }

  create(): void {
    this.createTextures();
    this.drawGround();

    const obstacles = this.physics.add.staticGroup();
    this.createBuildings(obstacles);
    this.createHotspots();
    this.createPlayer();
    this.createInput();
    this.createPrompt();

    this.physics.add.collider(this.player, obstacles);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);
    this.scale.on('resize', (size: Phaser.Structs.Size) => {
      this.prompt.setPosition(size.width / 2, size.height - 55);
    });

    frontendBridge.emit('scene:ready', undefined);
  }

  update(): void {
    const speed = 190;
    let horizontal = 0;
    let vertical = 0;

    if (this.cursors.left.isDown || this.movementKeys.left.isDown) horizontal -= 1;
    if (this.cursors.right.isDown || this.movementKeys.right.isDown) horizontal += 1;
    if (this.cursors.up.isDown || this.movementKeys.up.isDown) vertical -= 1;
    if (this.cursors.down.isDown || this.movementKeys.down.isDown) vertical += 1;

    const direction = new Phaser.Math.Vector2(horizontal, vertical).normalize().scale(speed);
    this.player.setVelocity(direction.x, direction.y);

    const nearest = HOTSPOTS.find(
      (hotspot) => Phaser.Math.Distance.Between(this.player.x, this.player.y, hotspot.x, hotspot.y) < 78,
    );

    if (nearest !== this.nearbyHotspot) {
      this.nearbyHotspot = nearest ?? null;
      this.prompt.setVisible(Boolean(nearest));
      frontendBridge.emit('location:nearby', { label: nearest?.label ?? null });
    }

    if (this.nearbyHotspot && Phaser.Input.Keyboard.JustDown(this.movementKeys.interact)) {
      frontendBridge.emit('location:interact', {
        locationId: this.nearbyHotspot.locationId,
        panel: this.nearbyHotspot.panel,
      });
    }
  }

  private createTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    graphics.fillStyle(0xe7ff74);
    graphics.fillRoundedRect(4, 8, 24, 22, 5);
    graphics.fillStyle(0x111a18);
    graphics.fillRect(10, 14, 4, 4);
    graphics.fillRect(18, 14, 4, 4);
    graphics.fillRect(12, 24, 8, 3);
    graphics.generateTexture('player', 32, 36);

    graphics.clear();
    graphics.fillStyle(0x243a36);
    graphics.fillRoundedRect(0, 0, 32, 32, 6);
    graphics.lineStyle(2, 0x78a89e);
    graphics.strokeRoundedRect(1, 1, 30, 30, 6);
    graphics.generateTexture('obstacle', 32, 32);
    graphics.destroy();
  }

  private drawGround(): void {
    const ground = this.add.graphics();
    ground.fillStyle(0x101c1a);
    ground.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    ground.lineStyle(1, 0x1a2926, 0.65);
    for (let x = 0; x <= WORLD_WIDTH; x += 40) ground.lineBetween(x, 0, x, WORLD_HEIGHT);
    for (let y = 0; y <= WORLD_HEIGHT; y += 40) ground.lineBetween(0, y, WORLD_WIDTH, y);

    ground.fillStyle(0x23312e);
    ground.fillRect(0, 365, WORLD_WIDTH, 95);
    ground.fillRect(570, 0, 100, WORLD_HEIGHT);

    ground.lineStyle(2, 0x91aca5, 0.25);
    ground.lineBetween(0, 412, WORLD_WIDTH, 412);
    ground.lineBetween(620, 0, 620, WORLD_HEIGHT);
  }

  private createBuildings(obstacles: Phaser.Physics.Arcade.StaticGroup): void {
    this.addBuilding(obstacles, 80, 80, 330, 210, 'COMPUTER LAB', 'Ship first. Refactor never.');
    this.addBuilding(obstacles, 735, 75, 360, 225, 'LIBRARY', 'Quietly grinding since 1974.');
    this.addBuilding(obstacles, 800, 515, 360, 205, 'CAREER CENTRE', 'One résumé template fits all.');
    this.addBuilding(obstacles, 80, 545, 350, 180, 'CAFÉ 404', 'Networking endpoint not found.');
  }

  private addBuilding(
    obstacles: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    subtitle: string,
  ): void {
    const shape = this.add.rectangle(x, y, width, height, 0x1b2b28).setOrigin(0);
    shape.setStrokeStyle(2, 0x35514b);
    obstacles.add(shape);
    const collisionBody = shape.body as Phaser.Physics.Arcade.StaticBody;
    collisionBody.setSize(width, height);
    collisionBody.updateFromGameObject();

    this.add.text(x + 20, y + 20, title, {
      fontFamily: 'monospace',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#dceae6',
    });
    this.add.text(x + 20, y + 48, subtitle, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#78968f',
    });
  }

  private createHotspots(): void {
    HOTSPOTS.forEach((hotspot) => {
      this.add.circle(hotspot.x, hotspot.y, 22, hotspot.color, 0.15).setStrokeStyle(2, hotspot.color, 0.8);
      this.add.circle(hotspot.x, hotspot.y, 5, hotspot.color);
      this.tweens.add({
        targets: this.add.circle(hotspot.x, hotspot.y, 10, hotspot.color, 0.18),
        scale: 2.2,
        alpha: 0,
        duration: 1500,
        repeat: -1,
        ease: 'Sine.easeOut',
      });
    });
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(565, 410, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body!.setSize(22, 26).setOffset(5, 8);
    this.player.setDepth(10);
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
