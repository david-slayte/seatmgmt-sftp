interface Seat {
  learnerUuid: string
  courseCode: string
  completedDate?: string
  score?: string
  status?: string
}

interface LatitudeUser {
  'User Login ID': string
  'Course Code': string
  'Location Code': string
  'Score Date': string
  Score: string
  Status: string
  'Expiration Date': string
  Notes: string
}

export const compareConstantTime = (val1, val2) => {
  if (!val1 || !val2) {
    return false
  }

  if (val1.length !== val2.length) {
    return false
  }

  let sentinel
  for (let i = 0; i <= val1.length - 1; i++) {
    sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i)
  }

  return sentinel === 0
}

export const notImplemented = (name) => {
  return () => {
    console.log('Not implemented: ' + name)
  }
}

export const mapLatitudeUserToSeat = (
  latitudeUser: LatitudeUser
): Seat => {
  return {
    learnerUuid: latitudeUser['User Login ID'],
    courseCode: latitudeUser['Course Code'],
    completedDate: latitudeUser['Score Date'],
    score: latitudeUser.Score,
    status: latitudeUser.Status
  }
}
