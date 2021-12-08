import {
  InvalidCoordinatesError,
  InvalidBusinessTitleLengthError,
  InvalidAccountStatusError,
} from "@domain/errors"

export * from "./errors"
export * from "./api-keys"
export * from "./limits-checker"

export const AccountLevel = {
  One: 1,
  Two: 2,
} as const

export const AccountStatus = {
  Locked: "locked",
  Active: "active",
} as const

export const checkedCoordinates = ({
  latitude,
  longitude,
}: {
  latitude: number
  longitude: number
}) => {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return new InvalidCoordinatesError()
  }
  const coordinates: Coordinates = { latitude, longitude }
  return coordinates
}

export const checkedMapTitle = (title: string) => {
  if (title.length < 3 || title.length > 100) {
    return new InvalidBusinessTitleLengthError()
  }
  return title as BusinessMapTitle
}

export const checkedAccountStatus = (status: string) => {
  if (!Object.values(AccountStatus).includes(status as AccountStatus)) {
    return new InvalidAccountStatusError()
  }
  return status as AccountStatus
}
