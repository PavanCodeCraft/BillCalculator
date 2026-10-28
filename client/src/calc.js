export const RATE = 10; // Rs per unit

export function calculate({ room1Cur, room2Cur, motorCur, room1Prev, room2Prev, motorPrev }) {
  const r1Used = room1Cur - room1Prev;
  const r2Used = room2Cur - room2Prev;
  const motorUsed = motorCur - motorPrev;

  // Motor split: 3 equal parts — owner, room1, room2 (1/3 each)
  const motorOwnerShare = motorUsed / 3;
  const motorPerRoom = motorUsed / 3;
  const motorTenantsShare = motorPerRoom * 2; // room1 + room2 combined

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