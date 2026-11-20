"use server";

import { createAuthSession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";

export async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  let errors = {};
  if (!email.includes("@")) {
    errors.email = "Please enter a valid email address";
  }
  if (password.trim().length < 8) {
    errors.password = "Password must be atleast 8 characters long";
  }
  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

  const hashedPassword = hashUserPassword(password);
  try {
    createUser(email, hashedPassword);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email: "It seems like an account for the chosen email already exists",
        },
      };
    }
    throw error;
  }
  redirect("/training");
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const existingUsers = getUserByEmail(email);
  if (!existingUsers) {
    return {
      errors: {
        email: "Could not authenticate please check your credentials",
      },
    };
  }

  const isValidPassword = verifyPassword(existingUsers.password, password);
  if (!isValidPassword) {
    return {
      errors: {
        password: "Could not authenticate please check your credentials",
      },
    };
  }

  await createAuthSession(existingUsers.id, password);
  redirect("/training");
}

export async function auth(mode, prevState, formData) {
  if (mode === "login") {
    return login(prevState, formData);
  } else if (mode === "signup") {
    return signup(prevState, formData);
  }
}
