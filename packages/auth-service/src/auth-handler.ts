import * as grpc from '@grpc/grpc-js';

/** Placeholder for Login RPC. */
export function handleLogin(call: any, callback: grpc.sendUnaryData<any>): void {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'Login handler not yet implemented',
  });
}

/** Placeholder for Logout RPC. */
export function handleLogout(call: any, callback: grpc.sendUnaryData<any>): void {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'Logout handler not yet implemented',
  });
}

/** Placeholder for ValidateToken RPC. */
export function handleValidateToken(call: any, callback: grpc.sendUnaryData<any>): void {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'ValidateToken handler not yet implemented',
  });
}
