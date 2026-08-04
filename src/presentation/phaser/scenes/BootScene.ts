import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  private progressFill!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('boot');
  }

  preload(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.cameras.main.setBackgroundColor('#07110f');

    this.add
      .rectangle(centerX + 5, centerY + 6, 286, 154, 0x020504)
      .setStrokeStyle(0)
      .setOrigin(0.5);
    this.add
      .rectangle(centerX, centerY, 286, 154, 0x101a17)
      .setStrokeStyle(4, 0x354b45)
      .setOrigin(0.5);
    this.add
      .rectangle(centerX, centerY, 266, 134, 0x0a1412)
      .setStrokeStyle(2, 0x2b403a)
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY - 50, 'LARP', {
        fontFamily: 'Silkscreen',
        fontSize: '30px',
        color: '#d9ff57',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 1, '> SIMULATING EMPLOYABILITY_', {
        fontFamily: 'Silkscreen',
        fontSize: '8px',
        color: '#77938b',
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    const track = this.add.rectangle(centerX, centerY + 38, 220, 8, 0x2b403a);
    this.progressFill = this.add
      .rectangle(centerX - 110, centerY + 38, 5, 8, 0xd9ff57)
      .setOrigin(0, 0.5);

    this.load.on('progress', (progress: number) => {
      this.progressFill.width = Math.max(5, 220 * progress);
    });

    track.setDepth(1);
    this.progressFill.setDepth(2);

    this.load.image('campus-tiles', 'assets/tiles/campus-tiles.png');
    this.load.tilemapTiledJSON('campus-map', 'assets/maps/campus.tmj');
    this.load.spritesheet('player', 'assets/sprites/player.png', {
      frameWidth: 16,
      frameHeight: 24,
    });
  }

  create(): void {
    this.progressFill.width = 220;
    this.scene.start('world');
  }
}
