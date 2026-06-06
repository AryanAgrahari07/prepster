import useAuthStore from '../store/authStore';
import { PLANS, ROLES } from '../constants/index';

/**
 * Convenience hook wrapping the Zustand auth store.
 * Provides computed boolean helpers so components don't need to repeat
 * subscription/plan/role checks inline.
 */
export default function useAuth() {
  const { user, isAuthenticated, isHydrated, login, logout, checkAuth, register } = useAuthStore();

  const isPro =
    isAuthenticated &&
    user?.subscription?.plan === PLANS.PRO &&
    user?.subscription?.status === 'active' &&
    new Date(user?.subscription?.expiresAt) > new Date();

  const isAdmin =
    isAuthenticated &&
    (user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN);

  const isEmployer =
    isAuthenticated &&
    (user?.role === ROLES.EMPLOYER || isAdmin);

  const profileCompletion = (() => {
    if (!user?.profile) return 0;
    const p = user.profile;
    const fields = [p.firstName, p.lastName, p.college, p.branch, p.graduationYear, p.cgpa, p.phone, p.avatar, p.targetCompanies?.length > 0];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })();

  return {
    user,
    isAuthenticated,
    isHydrated,
    isPro,
    isAdmin,
    isEmployer,
    profileCompletion,
    login,
    logout,
    checkAuth,
    register,
  };
}
