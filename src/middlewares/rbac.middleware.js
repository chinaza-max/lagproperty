import { ForbiddenError, UnAuthorizedError } from "../errors/index.js";
import { Admin } from "../db/models/index.js";

/**
 * RBAC Middleware for Admin Role & Privilege enforcement
 */
class RBACMiddleware {
  /**
   * Ensure requesting user is an active Admin
   */
  async requireAdmin(req, res, next) {
    try {
      if (!req.user) {
        throw new UnAuthorizedError("Authentication required.");
      }

      // Check admin record in DB or token payload
      const admin = await Admin.findOne({
        where: {
          id: req.user.id,
          isDeleted: false,
          disableAccount: false,
        },
      });

      if (!admin) {
        throw new ForbiddenError("Access restricted to active Admin users.");
      }

      req.admin = admin;
      return next();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Enforce specific Admin Roles (e.g. super_admin, finance_admin, compliance_admin, etc.)
   */
  requireAdminRole(...allowedRoles) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          throw new UnAuthorizedError("Authentication required.");
        }

        const admin = await Admin.findOne({
          where: {
            id: req.user.id,
            isDeleted: false,
            disableAccount: false,
          },
        });

        if (!admin) {
          throw new ForbiddenError("Access restricted to active Admin users.");
        }

        const userRole = (admin.role || "admin").toLowerCase();
        
        // super_admin always has access
        if (userRole === "super_admin" || allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
          req.admin = admin;
          return next();
        }

        throw new ForbiddenError(
          `Action requires one of the following admin roles: ${allowedRoles.join(", ")}`
        );
      } catch (error) {
        return next(error);
      }
    };
  }

  /**
   * Enforce specific Privileges (e.g. 'financial_analytics', 'agent_blacklist', 'admin_management')
   */
  requireAdminPrivilege(...requiredPrivileges) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          throw new UnAuthorizedError("Authentication required.");
        }

        const admin = await Admin.findOne({
          where: {
            id: req.user.id,
            isDeleted: false,
            disableAccount: false,
          },
        });

        if (!admin) {
          throw new ForbiddenError("Access restricted to active Admin users.");
        }

        const userRole = (admin.role || "admin").toLowerCase();
        if (userRole === "super_admin" || admin.privilege === "all" || admin.privilege === "*") {
          req.admin = admin;
          return next();
        }

        const adminPrivileges = (admin.privilege || "").split(",").map((p) => p.trim().toLowerCase());
        const hasPrivilege = requiredPrivileges.some((reqPriv) =>
          adminPrivileges.includes(reqPriv.toLowerCase())
        );

        if (!hasPrivilege) {
          throw new ForbiddenError(
            `Action requires privilege: ${requiredPrivileges.join(" OR ")}`
          );
        }

        req.admin = admin;
        return next();
      } catch (error) {
        return next(error);
      }
    };
  }
}

export default new RBACMiddleware();
