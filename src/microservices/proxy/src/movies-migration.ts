export class MoviesMigration {
  constructor(
    private readonly isGradualMigrationEnabled: boolean,
    private readonly percent: number,
  ) {}

  public isRoutedToMoviesService(userId?: string): boolean {
    if (!this.isGradualMigrationEnabled) {
      return true;
    }
    const bucket = userId ? Number(userId) % 100 : Math.random() * 100;
    return bucket < this.percent;
  }
}
