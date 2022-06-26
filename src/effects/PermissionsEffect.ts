import { useCallback, useEffect, useState } from 'react';
import {
  checkMultiple,
  Permission,
  PermissionStatus,
  requestMultiple,
  PERMISSIONS as RNPERMISSIONS,
} from 'react-native-permissions';

export const PERMISSIONS = RNPERMISSIONS;

export function usePermissionsEffect(permissions: Permission[]) {
  const [permissionsStatus, setPermissionsStatus] = useState<
    Record<Permission, PermissionStatus | null>
  >(
    permissions.reduce((prev, curr) => {
      prev[curr] = false;
      return prev;
    }, {} as any),
  );

  const checkPermissions = useCallback(() => {
    checkMultiple(permissions).then(statuses => setPermissionsStatus(statuses));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(permissions)]);

  const requestPermissions = useCallback(() => {
    requestMultiple(permissions).then(statuses => {
      setPermissionsStatus(statuses);
    });
  }, [permissions]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissionsStatus,
    requestPermissions,
  };
}
