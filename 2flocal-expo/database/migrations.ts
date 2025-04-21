// Define migrations for schema changes
// This is an empty array for now, but we'll add migrations when needed
interface Migration {
  toVersion: number;
  steps: any[];
}

const migrations: Migration[] = [];

export default migrations;