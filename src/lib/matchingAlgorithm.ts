/**
 * Advanced Matching Algorithm
 * Calculates compatibility score between two users based on multiple factors
 */

export interface UserProfile {
  id: string;
  age: number;
  gender: string;
  sexualOrientation: string;
  bodyType: string;
  faceType: string;
  sexualInterests: string[];
  desiredPartnerPhysical: string;
  comfortLevel: "chat only" | "make-out" | "sex";
  latitude?: number;
  longitude?: number;
  locationRadius: string;
  isVerified: boolean;
}

interface CompatibilityScore {
  totalScore: number;
  breakdown: {
    interestMatch: number;
    orientationMatch: number;
    comfortLevelAlignment: number;
    verificationBonus: number;
    distanceFactor: number;
  };
}

/**
 * Calculate compatibility between two users
 * Score: 0-100 (higher is better)
 */
export function calculateCompatibility(
  userA: UserProfile,
  userB: UserProfile
): CompatibilityScore {
  let totalScore = 0;
  const breakdown = {
    interestMatch: 0,
    orientationMatch: 0,
    comfortLevelAlignment: 0,
    verificationBonus: 0,
    distanceFactor: 0,
  };

  // 1. Sexual Interests Match (30 points max)
  const commonInterests = userA.sexualInterests.filter((interest) =>
    userB.sexualInterests.includes(interest)
  );
  breakdown.interestMatch =
    userA.sexualInterests.length > 0
      ? (commonInterests.length / userA.sexualInterests.length) * 30
      : 15; // Default 15 if no interests specified

  // 2. Orientation Match (25 points max)
  breakdown.orientationMatch = calculateOrientationCompatibility(
    userA.gender,
    userA.sexualOrientation,
    userB.gender,
    userB.sexualOrientation
  );

  // 3. Comfort Level Alignment (20 points max)
  breakdown.comfortLevelAlignment = calculateComfortLevelAlignment(
    userA.comfortLevel,
    userB.comfortLevel
  );

  // 4. Verification Bonus (15 points max)
  if (userA.isVerified && userB.isVerified) {
    breakdown.verificationBonus = 15;
  } else if (userA.isVerified || userB.isVerified) {
    breakdown.verificationBonus = 7.5;
  }

  // 5. Distance Factor (10 points max) - if location data available
  if (userA.latitude && userA.longitude && userB.latitude && userB.longitude) {
    breakdown.distanceFactor = calculateDistanceFactor(
      userA.latitude,
      userA.longitude,
      userB.latitude,
      userB.longitude,
      parseLocationRadius(userA.locationRadius)
    );
  } else {
    breakdown.distanceFactor = 5; // Default if no location
  }

  totalScore = Math.min(
    100,
    breakdown.interestMatch +
      breakdown.orientationMatch +
      breakdown.comfortLevelAlignment +
      breakdown.verificationBonus +
      breakdown.distanceFactor
  );

  return {
    totalScore: Math.round(totalScore),
    breakdown: {
      interestMatch: Math.round(breakdown.interestMatch),
      orientationMatch: Math.round(breakdown.orientationMatch),
      comfortLevelAlignment: Math.round(breakdown.comfortLevelAlignment),
      verificationBonus: Math.round(breakdown.verificationBonus),
      distanceFactor: Math.round(breakdown.distanceFactor),
    },
  };
}

/**
 * Calculate orientation compatibility
 * Returns 0-25 points
 */
function calculateOrientationCompatibility(
  userAGender: string,
  userAOrientation: string,
  userBGender: string,
  userBOrientation: string
): number {
  const orientationMap: { [key: string]: string[] } = {
    heterosexual: ["opposite"],
    homosexual: ["same"],
    bisexual: ["any"],
    asexual: ["any"],
    pansexual: ["any"],
  };

  const aPreferences = orientationMap[userAOrientation.toLowerCase()] || [];
  const bPreferences = orientationMap[userBOrientation.toLowerCase()] || [];

  const sameGender = userAGender.toLowerCase() === userBGender.toLowerCase();

  let score = 0;

  // Check if A would be interested in B
  if (
    aPreferences.includes("any") ||
    (aPreferences.includes("opposite") && !sameGender) ||
    (aPreferences.includes("same") && sameGender)
  ) {
    score += 12.5;
  }

  // Check if B would be interested in A
  if (
    bPreferences.includes("any") ||
    (bPreferences.includes("opposite") && !sameGender) ||
    (bPreferences.includes("same") && sameGender)
  ) {
    score += 12.5;
  }

  return score;
}

/**
 * Calculate comfort level alignment
 * Returns 0-20 points
 */
function calculateComfortLevelAlignment(
  comfortA: string,
  comfortB: string
): number {
  const comfortHierarchy = ["chat only", "make-out", "sex"];
  const levelA = comfortHierarchy.indexOf(comfortA);
  const levelB = comfortHierarchy.indexOf(comfortB);

  if (levelA === -1 || levelB === -1) return 10; // Default if invalid

  // Maximum score if both want the same level
  if (levelA === levelB) return 20;

  // Partial score if one is higher (e.g., one wants sex, other wants make-out)
  const difference = Math.abs(levelA - levelB);
  return Math.max(10, 20 - difference * 5);
}

/**
 * Calculate distance factor
 * Returns 0-10 points (higher is better)
 */
function calculateDistanceFactor(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  maxDistance: number
): number {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);

  if (distance > maxDistance) {
    return 0; // Outside preferred radius
  }

  // Linear decrease based on distance
  return Math.max(0, 10 * (1 - distance / maxDistance));
}

/**
 * Calculate distance between two coordinates (in km)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Parse location radius string to km
 */
function parseLocationRadius(radius: string): number {
  const radiusMap: { [key: string]: number } = {
    "5km": 5,
    "10km": 10,
    "25km": 25,
    "50km": 50,
    "100km": 100,
    "anywhere": 10000,
  };
  return radiusMap[radius.toLowerCase()] || 50;
}

/**
 * Filter and rank potential matches
 */
export function rankPotentialMatches(
  currentUser: UserProfile,
  potentialMatches: UserProfile[],
  minCompatibilityScore: number = 30
): Array<UserProfile & { compatibilityScore: CompatibilityScore }> {
  return potentialMatches
    .map((match) => ({
      ...match,
      compatibilityScore: calculateCompatibility(currentUser, match),
    }))
    .filter((match) => match.compatibilityScore.totalScore >= minCompatibilityScore)
    .sort(
      (a, b) =>
        b.compatibilityScore.totalScore - a.compatibilityScore.totalScore
    );
}
