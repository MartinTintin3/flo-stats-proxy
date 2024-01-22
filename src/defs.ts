export enum Progress {
	None = 0,
	Loading = 1,
	Loaded = 2,
}

export type Ratio = [number, number];

export type Nullable<T> = T | null;

export interface Stats {
	total: number;
	wins: number;
	losses: number;
	pins: number;
	techs: number;
	ratio: Ratio;
}

export interface Wrestler {
	id: string;
	createdTimestamp: number;
	division: string;
	firstName: string;
	lastName: string;
	grade: {
		name: string;
		number: number;
	};
	location: {
		city: string;
		country: string;
		state: string;
	};
	modifiedTimestamp: number;
	stats: Stats;
}

export interface Data {
	wrestler: Nullable<Wrestler>,
}

/**
 * Calculate ratio of wins to losses
 * @return {[number, number]}
 * @param {number} wins
 * @param {number} losses
 */
export function ratio(wins: number, losses: number): [number, number]{
	/**
	 * @param {number} a
	 * @param {number} b
	 * @return {number}
	 */
	const get_gcd = (a: number, b: number): number => {
		return b ? get_gcd(b, a % b) : a;
	};

	if (wins == 0) return [0, losses];
	if (losses == 0) return [wins, 0];

	const gcd = get_gcd(wins,losses);
	return [wins / gcd, losses / gcd];
}