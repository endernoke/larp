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

    this.cameras.main.setBackgroundColor('#0b1110');
    this.add
      .text(centerX, centerY - 50, 'LARP', {
        fontFamily: 'monospace',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#e7ff74',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 2, 'SIMULATING EMPLOYABILITY…', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#8ea6a0',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    const track = this.add.rectangle(centerX, centerY + 38, 220, 5, 0x243330);
    this.progressFill = this.add.rectangle(centerX - 110, centerY + 38, 5, 5, 0xe7ff74).setOrigin(0, 0.5);

    this.load.on('progress', (progress: number) => {
      this.progressFill.width = Math.max(5, 220 * progress);
    });

    // TODO(frontend-assets): Load tilemaps, sprites, and audio here. The
    // progress listener above will automatically represent actual asset load.
    track.setDepth(1);
    this.progressFill.setDepth(2);
  }

  create(): void {
    // With no external assets the boot scene completes immediately. Once real
    // assets are queued in preload(), Phaser will hold here until they finish.
    this.progressFill.width = 220;
    this.scene.start('world');
  }
}
