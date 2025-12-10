import { ClinicDirectoryRecord } from '@/lib/types/clinicDirectory'

let DIRECTORY_STORE: ClinicDirectoryRecord[] = []

export function getDirectoryStore(): ClinicDirectoryRecord[] {
  return DIRECTORY_STORE
}

export function mutateDirectoryStore(next: ClinicDirectoryRecord[]) {
  DIRECTORY_STORE = next
}

