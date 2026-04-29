export const RATE = 10; // Rs per unit

export function calculate({ room1Cur, room2Cur, motorCur, room1Prev, room2Prev, motorPrev }) {
  const r1Used = room1Cur - room1Prev;
  const r2Used = room2Cur - room2Prev;
  const motorUsed = motorCur - motorPrev;

  // Motor split: half owner, half split between room1 & room2
  const motorOwnerShare = motorUsed / 2;
  const motorTenantsShare = motorUsed / 2;
  const motorPerRoom = motorTenantsShare / 2;

  // Room totals
  const r1Total = r1Used + motorPerRoom;
  const r2Total = r2Used + motorPerRoom;

  return {
    room1: {
      previousReading: room1Prev,
      currentReading: room1Cur,
      unitsUsed: r1Used,
      shareOfMotor: motorPerRoom,
      totalUnits: r1Total,
      amount: r1Total * RATE,
    },
    room2: {
      previousReading: room2Prev,
      currentReading: room2Cur,
      unitsUsed: r2Used,
      shareOfMotor: motorPerRoom,
      totalUnits: r2Total,
      amount: r2Total * RATE,
    },
    motor: {
      previousReading: motorPrev,
      currentReading: motorCur,
      unitsUsed: motorUsed,
      ownerShare: motorOwnerShare,
      tenantsShare: motorTenantsShare,
      perRoomShare: motorPerRoom,
    },
    ratePerUnit: RATE,
  };
}