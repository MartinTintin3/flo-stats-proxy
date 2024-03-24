export enum Progress {
	None = 0,
	Loading = 1,
	Loaded = 2,
}

export type Ratio = [number, number];

export type Grade = { name: string; number: number; };

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
	firstName: string;
	lastName: string;
	grade: Nullable<Grade>;
	location: {
		city: string;
		country: string;
		state: string;
	};
	total_stats: Stats;
	seasons: Array<{
		season: string;
		stats: Stats;
		grade: Nullable<Grade>;
	}>;
}

export interface Data {
	response_size: Nullable<number>;
	wrestler: Nullable<Wrestler>;
}

/**
 * Calculate ratio of wins to losses
 * @return {Ratio}
 * @param {number} wins
 * @param {number} losses
 */
export function ratio(wins: number, losses: number): Ratio {
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

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si = false, dp = 1): string {
	const thresh = si ? 1000 : 1024;
  
	if (Math.abs(bytes) < thresh) return bytes + " B";
  
	const units = si 
		? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] 
		: ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	let u = -1;
	const r = 10 ** dp;
  
	do {
		bytes /= thresh;
		++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

	return bytes.toFixed(dp) + " " + units[u];
}