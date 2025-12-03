/**
 * Role mapping utilities for converting between database strings and protobuf enums.
 * Centralized to ensure consistency across all microservices.
 */

export const UserRoleProto = {
  STUDENT: 0,
  FACULTY: 1,
  ADMIN: 2,
} as const;

export type UserRoleString = 'STUDENT' | 'FACULTY' | 'ADMIN';

/**
 * Converts database role string to protobuf enum integer.
 * @param role - Role string from database ('STUDENT', 'FACULTY', 'ADMIN')
 * @returns Protobuf enum integer (0, 1, 2)
 */
export function roleToProtoEnum(role: UserRoleString): number {
  return UserRoleProto[role];
}

/**
 * Converts protobuf enum integer to role string.
 * @param enumValue - Protobuf enum integer (0, 1, 2)
 * @returns Role string ('STUDENT', 'FACULTY', 'ADMIN')
 */
export function protoEnumToRole(enumValue: number): UserRoleString {
  switch (enumValue) {
    case UserRoleProto.STUDENT:
      return 'STUDENT';
    case UserRoleProto.FACULTY:
      return 'FACULTY';
    case UserRoleProto.ADMIN:
      return 'ADMIN';
    default:
      return 'STUDENT';
  }
}
