
		 User Authentication

Users to login and logout from the application in Next.js are explained below
Login form as follows

components/auth-form.js


import Link from 'next/link';

export default function AuthForm() {
  return (
    <form id="auth-form">
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      <p>
        <button type="submit">
          Create Account
        </button>
      </p>
      <p>
        <Link href="/">Login with existing account.</Link>
      </p>
    </form>
  );
}


the database file as follows

lib/db.js


import sql from 'better-sqlite3';

const db = sql('training.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT
  );
`);

db.exec(`CREATE TABLE IF NOT EXISTS sessions (
  id TEXT NOT NULL PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`);

db.exec(`
  CREATE TABLE IF NOT EXISTS trainings (
    id INTEGER PRIMARY KEY,
    title TEXT,
    image TEXT,
    description TEXT
  );
`);

const hasTrainings =
  db.prepare('SELECT COUNT(*) as count FROM trainings').get().count > 0;

if (!hasTrainings) {
  db.exec(`
    INSERT INTO trainings (title, image, description)
    VALUES
    ('Yoga', '/yoga.jpg', 'A gentle way to improve flexibility and balance.'),
    ('Boxing', '/boxing.jpg', 'A high-energy workout that improves strength and speed.'),
    ('Running', '/running.jpg', 'A great way to improve cardiovascular health and endurance.'),
    ('Weightlifting', '/weightlifting.jpg', 'A strength-building workout that helps tone muscles.'),
    ('Cycling', '/cycling.jpg', 'A low-impact workout that improves cardiovascular health and endurance.'),
    ('Gaming', '/gaming.jpg', 'A fun way to improve hand-eye coordination and reflexes.'),
    ('Sailing', '/sailing.jpg', 'A relaxing way to enjoy the outdoors and improve balance.');
`);
}

export default db;



app/page.js

import AuthForm from '@/components/auth-form';

export default async function Home() {
  return <AuthForm />;
}


The following is the page which should be accessed only if user are authorized to have access

app/training/page.js

import { getTrainings } from '@/lib/training';

export default async function TrainingPage() {
  const trainingSessions = getTrainings();

  return (
    <main>
      <h1>Find your favorite activity</h1>
      <ul id="training-sessions">
        {trainingSessions.map((training) => (
          <li key={training.id}>
            <img src={`/trainings/${training.image}`} alt={training.title} />
            <div>
              <h2>{training.title}</h2>
              <p>{training.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}


IN the Signup page (i.e components/auth-form.js)  when clicking on button 'create account' submit the entered data. And a new user is created with email and password combination. The email entered should be valid.


components/auth-form.js

import Link from 'next/link';

export default function AuthForm() {
  return (
    <form id="auth-form">
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      <p>
        <button type="submit">
          Create Account
        </button>
      </p>
      <p>
        <Link href="/">Login with existing account.</Link>
      </p>
    </form>
  );
}



To serve server action we need to use 'use server' in the top of file. Then create an async function (here named 'signup'), that accepts form data as arguments.
We will be extracting form data as follows

 async function signup(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
}

'email' and 'password' which we get from 'formData' is where we get from 'components/auth-form.js' as 'name' value, like shown below

 <input type="email" name="email" id="email" />
 <input type="password" name="password" id="password" />

In 'signup' function we will need to validate the email therefore we add 'errors' object, after assigning valid error message in 'errors' object we need to pass to frontend form and output there. For that we can use 'useFormState' hook in 'components/auth-form.js'

actions/auth-actions.js

"use server";

export async function signup(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  let errors = {};
  if (!email.includes("@")) {
    errors.email = "Please enter a valid email address";
  }
  if (password.trim().length < 8) {
    errors.password = "Password must be atleast 8 characters long";
  }
}

So, we added "use-client" in 'components/auth-form.js' because 'useFormState' hook is used. 'useFormState' hook imports from 'react-dom'.(i.e  'import { useFormState } from "react-dom";' ). The server action need to be passed to 'useFormState', as a first argument to the hook. And import 'signup' in 'components/auth-form.js' (i.e import { signup } from "@/actions/auth-actions"; )

And in 'useFormState' first argument will be passed the 'signup' function (i.e   useFormState(signup, {}) ). Second argument to 'useFormState' is intial state which here is empty. ' useFormState(signup, {})' from this we will get 2 exactly array elements. In which the first element will be the form state 'formState' and the second argument will be action 'formAction'.

 const [formState, formAction] = useFormState(signup, {});

 'formAction' should be assigned to the 'form' tag as value to 'action' prop.

 <form id="auth-form" action={formAction}>

'formState' is the one that is has the potential error messages, for incorrect values entered for 'email' and 'password'.

'formState.errors' can be checked truthy above 'submit' button in 'form' tag. and add an unordered list with 'id' for styling purpose.
'Object.keys' (this is built in function used in JavaScript which converts a list of keys into an array) maps those keys (i.e here 'email', 'password') in that errors object to list items

    {formState.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}
        </ul>
      )}


Where 'formState.errors[error]' will be either 'email' or 'password' will be the keys and the error message will be the values.

components/auth-form.js

"use-client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signup } from "@/actions/auth-actions";
export default function AuthForm() {
  const [formState, formAction] = useFormState(signup, {});
  return (
    <form id="auth-form" action={formAction}>
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {formState.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}
        </ul>
      )}
      <p>
        <button type="submit">Create Account</button>
      </p>
      <p>
        <Link href="/">Login with existing account.</Link>
      </p>
    </form>
  );
}


But in the 'signup' function in 'actions/auth-action.js file will have first argument 'prevState' which is the previous state and the second argument as usual the 'formData' due to server actions.

like 

export async function signup(prevState, formData) {


need to return 'errors' object in 'actions/auth-actions.js'

  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

the above checks if either 'email' and 'password' input entered is not a valid one then return the 'errors' object to the form. This return value will be the 'formState' in  'components/auth-form.js'.

actions/auth-actions.js

"use server";

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
}

If a valid email and password is entered then we need to add the user into the database.

lib/user.js

import db from "./db";

export function createUser(email, password) {
  const result = db
    .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
    .run(email, password);
  return result.lastInsertRowid;
}


'createUser' function must accept email and password as arguments and save it in database. 'prepare' and 'run' are SQLite function provided to interact with database.

The passwords need to be heashed before storing in database, so anyone access to the database cannot read the password what it is in database. Below is the file for hash password.

lib/hash.js

import crypto from 'node:crypto';

export function hashUserPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');

  const hashedPassword = crypto.scryptSync(password, salt, 64);
  return hashedPassword.toString('hex') + ':' + salt;
}

export function verifyPassword(storedPassword, suppliedPassword) {
  const [hashedPassword, salt] = storedPassword.split(':');
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
  const suppliedPasswordBuf = crypto.scryptSync(suppliedPassword, salt, 64);
  return crypto.timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}


'verifyPassword' will rehashed the password when we want to login by the user this function will check if the password entered during login is a correct one.

actions/auth-actions.js

"use server";

import { hashUserPassword } from "@/lib/hash";
import { createUser } from "@/lib/user";

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
  createUser(email, hashedPassword);
}


'createUser(email, hashedPassword)' with this new user with valid email and password is created.


'createUser(email, hashedPassword)' should be wrapped in try, catch because SQLite package which we are using for interacting with the database, will actually throw error if the database complains for example we violate the unique constraint. If the email address exists already but again the user has entered the same email address.

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
}

If the try catch block is successfully passed then user will be created with the email and password provided, otherwise if try catch fails then user will not be created.
If user already created then redirect to 'training' page. Which is the home page when user is created.

actions/auth-actions.js

"use server";

import { hashUserPassword } from "@/lib/hash";
import { createUser } from "@/lib/user";
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



How User Authentication work

The users should not be able to login to 'training' page if they are not authorized. 
Authentication is a two part process and the first part is that we must be able to log users in which indeed means need to verify user credentials, email and password, check if they are valid.
If they match during the process of account creation and we want to mark the user who did provide valid credentials as authenticated. 
To remember this user who sent this request is authenticated and should be granted access to protected resources and this is the second part.
That we have certain resources that should be protected and should be made accessible to authenticated users, to users who logged in and who are marked as authenticated.

Lets deal with Part 1 user login

login users and mark them as authenticated. It starts with a client, a user visiting our website who in the end sends a request to our server, a request where they filled out that authentication form to either create a new user or login with an existing user. 
To the server from client they send some credenitals (email and password) along with that request, becuase they submitted that form. On the server the verification of those credentials, either because we just create a new user an dwe check whether we have a valid email and password. 
And the user does not exist yet or becuase the user tried to log in. We take a look at the existing users that we are stored in the database and we check the email password combination that was submitted is valid.
If it is valid, we then determine thta the user did provide correct credentials, we create a so called authentication session which is a database entry, that is stored in a dedicated table on the server (that is a cerain way user is considered to be authenticated, we store it in as a new data entry in a table database).
That entry in the table will have an ID and so caled session ID and sent that ID  to typically in a cookie to the user. 
So, the response to that authenication request to the login request contains a session cookie (cookie with a session ID, if the credentials were valid). 
The client the browser will automatically store that session cookie.
 
Part 2 Access Protected Resources
Now from the server the user is considered to be authenticated, now we can consider accessing protected resources. 
A user just has logged in and who has that cookie now sends a request to some route that should be protected.
Browser will automatically add cookies that belong to our website to those requests, so session cookie will automatically be attached to that request and will be sent to the server. 
On the server we can tak ea look at that session cookie and verify it is validity. 
If it contains session ID, we also have it in our database it it is a valid session id.
And those session ID is are not just some kind of numbers but more complex strings that cannot be easily made up.
Once we get a request witha valid active session cookie, we sent back the requested resource (page). 
For example, the page content the user wanted to see or cookie is not valid or if the session expired or sometinh like that we sent back an error.
This is how authentication works.

Lucia Auth is a third party library use in Next.js for authentication.

command to install lucia and additional package 'lucia-auth/adapter-sqlite' ( to allow lucia to store those sessions in SQLite database) 

npm install lucia @lucia-auth/adapter-sqlite

need to create and store those sessions, will lucia will create them for us but we need to tell lucia where to store them. 
For that we tell the SQLite database.
Lucia Auth instance created to create auth sessions and use them to identify authenticated users.

Creating a new lucia auth instance

create a new instance named 'lucia' (name can be of any choice), this 'lucia' variable should store a new object that is created with the help of the Lucia constructor function.

const lucia = new Lucia();

where constructor (i.e Lucia() ) are imported from 'import { Lucia } from 'lucia';' 
This constructor (i.e Lucia() ) need a couple of arguments. For example it needs an adapter which will tell Lucia where and how to store those sessions.
So we import 'import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite'; '
With this imported we can create a new adapter object by constructing this BetterSqlite3Adapter (i.e const adapter = new BetterSqlite3Adapter() ).
And to this adapter we need to pass a handle to our  BetterSqlite3.Database'
Assigning database to 'BetterSqlite3Adapter' constructor first argument 'const adapter = new BetterSqlite3Adapter(db);'
Second argument to 'BetterSqlite3Adapter' constructor is to pass a configuration object where you can tell this adapter what the table name of your user's datbase table will be.
where here 'users' is the table name in database, along with where you aare storing your sessions in the 'users' table is here it is 'sessions' table
'user' configuration object passed with main table name 'users' and session storing in 'session' configuration object with value of 'sessions' table.

const adapter = new BetterSqlite3Adapter(db,
{
 user: 'users',
 session: 'sessions'
}
);

And then 'adapter' constant value passed as first argument into 'Lucia' constructor.
And to the 'Lucia' constructor we pass second argument as the configuration object, like the 'sessionCookie' (becuase Lucia will create automatically that cookie that contains the session ID, because it is also 'Lucia' that creates the session, but we can configure the cookie).
And for example when using Lucia in a Nextjs Application, you should set 'expires' to 'false and we can add some attributes to that cookie.
And specificallly I want to set this cookie to only work on HTTPS, if we are running the app in production. 
(i.e attributes: { secure: process.env.NODE_ENV ==production } ), which is set if the apps is running in production (whoich means we are not running the application locally during development, but instead we now did deploying it).

const lucia = new Lucia(adapter,
{
  sessionCookie: {
   expires: false,
   attributes: { 
                secure: process.env.NODE_ENV ==production
               } 
	}
});

the above is an instance of 'Lucia', this instance can be used to create sessions, session cookies and to validate incoming requests to see if they have a valid session cookie.


Configuring a session and session cookie

'createAuthSession' function does for a given user, it should create and store a new session in that 'sessions' datbase table and it should then set such a cookie that is attached to the outgoing request.
'createAuthSession' function has a first argument which is the ID of the user to whom the session belongs as an input (i.e userId).
We can use 'lucia' object to create a session 'lucia.createSession()', and this will create a new entry in that 'sessions' database table and it will create a new unique session ID that belongs to that session.
'lucia.createSession(userId, {})' has the first argument as the user id, second argument takes a configuration object or some extra attributes we can store in the session or some extra data we can attach to that session.
Here we are not passing an extra data so we pass an empty object (i.e {} ).
'lucia.createSession(userId, {})' value for this will give a promise, so we need to use async and await. As a result we get a new session object (i.e 'const session = await lucia.createSession(userId, {});').
Now we get a session cookie which is created by 'Lucia', to precise we can get the data that should be set on a session cookie by calling 'lucia.createSessionCookie()'.
'lucia.createSessionCookie()' this function now wants the session ID as input, we get that from 'session' object declared just before (i.e 'const session = await lucia.createSession(userId, {});') and there we have an 'id' property (i.e 'lucia.createSessionCookie(session.id)').
'lucia.createSessionCookie(session.id)' this will give as an object that holds all the data that should be set on the session cookie.
To now set that cookie on the outgoing response in Next.js app, we can use a special cookies function which is actually provided by Next.js (i.e 'cookies()' ) and should be imported from 'next/headers' ('import { cookies } from 'next/headers';) 
'cookies' function can be called anywhere in the Next.js code to access that belongs to the outgoing response. So to set a new cookie on that response, for example so as to call cookies in 'createAuthSession', if we are using Next.js version 15 or higher we need to 'await' the calling of 'cookies()' function (i.e 'await cookies();' ).
For Next.js version lower then 15 need not have to use await (i.e 'cookies();' ).
To interact with cookies (i.e await cookies();) of the request is about to be sent back to the client (we can use set, delete, get (i.e '(await cookies()).set()' ))
).
set() takes mutliple arguments, multiple values that will be set on a cookie. Importance of 'licia is we can now use the session cookie object in set() function. 
We can pass 'sessionCookie' variable on 'set' function as 'sessionCookie.name', 'sessionCookie.value', 'sessionCookie.attributes' and calling this 3 in set( method is in the order we should call which is accepted by set function a new cookie with a given value, name with specific values, session ID and some attributes that configure the cookie.
Browser which try to log in will automatically store that cookie. To intiallize a new authentication session we can call the function 'createAuthSession(userId)'



lib/auth.js

import { cookies } from 'next/headers';
import { Lucia } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import db from './db';

const adapter = new BetterSqlite3Adapter(db,
{
 user: 'users',
 session: 'sessions'
}
);
const lucia = new Lucia(adapter,
{
  sessionCookie: {
   expires: false,
   attributes: { 
                secure: process.env.NODE_ENV ==production
               } 
	}
});


export async function createAuthSession(userId){
const session = await lucia.createSession(userId, {});
const sessionCookie = lucia.createSessionCookie(session.id);
(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}



the database file as follows

lib/db.js


import sql from 'better-sqlite3';

const db = sql('training.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT
  );
`);

db.exec(`CREATE TABLE IF NOT EXISTS sessions (
  id TEXT NOT NULL PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`);

db.exec(`
  CREATE TABLE IF NOT EXISTS trainings (
    id INTEGER PRIMARY KEY,
    title TEXT,
    image TEXT,
    description TEXT
  );
`);

const hasTrainings =
  db.prepare('SELECT COUNT(*) as count FROM trainings').get().count > 0;

if (!hasTrainings) {
  db.exec(`
    INSERT INTO trainings (title, image, description)
    VALUES
    ('Yoga', '/yoga.jpg', 'A gentle way to improve flexibility and balance.'),
    ('Boxing', '/boxing.jpg', 'A high-energy workout that improves strength and speed.'),
    ('Running', '/running.jpg', 'A great way to improve cardiovascular health and endurance.'),
    ('Weightlifting', '/weightlifting.jpg', 'A strength-building workout that helps tone muscles.'),
    ('Cycling', '/cycling.jpg', 'A low-impact workout that improves cardiovascular health and endurance.'),
    ('Gaming', '/gaming.jpg', 'A fun way to improve hand-eye coordination and reflexes.'),
    ('Sailing', '/sailing.jpg', 'A relaxing way to enjoy the outdoors and improve balance.');
`);
}

export default db;




Setting up an auth session


Before redirecting to "training" page in 'actions/auth-actions.js' file we can call 'createAuthSession'
'createAuthSession' has an argument as 'userId', so 'createUser(email, hashedPassword)' is assigned to a variable 'id' in 'actions/auth-actions.js' file
Hence passed as like this 'createAuthSession(id);', since 'createAuthSession' yields a promise as a result then we use await and thereafter will be redirected to 'training' page.
So, we are creating a new session each time when a new user is created.
In try catch block

    const id = createUser(email, hashedPassword);
    await createAuthSession(id);
    redirect("/training");



actions/auth-actions.js

"use server";

import { hashUserPassword } from "@/lib/hash";
import { createUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { createAuthSession } from '@/lib/auth';

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
    const id = createUser(email, hashedPassword);
    await createAuthSession(id);
    redirect("/training");
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

}



And we run the development server and create a new user with a valid email and password, we are redirected to 'training' page, but if we open developer tools (inspect browser) and go to 'Application' tab and then go to 'Cookes' section and select address "localhost:3000', we will find a cookie there which is that cookie created by 'Lucia'.
And the value stored in that cookie is the session ID. Now auth cookie which sent back with the help of 'cookies()' function which was configured based on Lucia. And browser will automatically attach that cookie to any outgoing requests. When we reload 'training' paeg and open the developer tools and go to 'Network' tab in the 'Headers' section in the Request headers a new field added 'Cookie', so auth cookie was automatically created.
To make 'training' page to be accessible only to logged in users, we need to check the existence of that auth cookie and verify its validity. thats how we can protect that page (i.e here 'training' page).
So, we can retrieve cookie with our session cookie name from the incoming request.



Verifying an active auth session

We can verify auth sessions so that we can verify whether a request is coming from a user who did log in. 
In 'lib/auth.js' file, we will export a new function which can be named 'verifyAuth()'. This function verifyAuth' should check whetehr an incoming request is coming from an authenticated user. So, if the incoming request has that authentication cookie and if it is a valid cookie, a cookie with a valid session ID that we stored on the server in the database.
First we need to retrieve cookie from the incoming request and therefore wecan use 'cookies()' function and then we use 'get' and pass 'lucia' object to 'get' argument.

cosnt sessionCookie = (await cookies()).get(lucia.sessionCookieName)

To check if not sessionCookie (if we do not have one) and in that case we will return an object, where to set 'user' to 'null' and 'session' to 'null'.

if(!sessionCookie)
{
return {
         user: null,
         session: null
};
}

Above indicates there is no user and session data and we can use that object in our routes, in our pages to verify whether we foundan authenticated user on the request or not.

or instead setting 'user' to 'null' and 'session' to 'null' we can pass just 'false' to indicate request is coming from an unauthenticated user.

if(!sessionCookie)
{
return false;
}


If cookie exists the we extract the sessionCookie value 'const sessionId = sessionCookie.value;'
If we do not have 'sessionId' then we wanna return this object without user data.

if(!sessionId)
{
return {
         user: null,
         session: null
};
}

Now we have a 'sessionId' then we have now a session cookie and session Id and now as the next step we need to validate this session.
We need to check whether it is a valid session ID.
For that we can use the 'Lucia' object and therefore call 'validateSession()' and pass sessionID as arguemnt to this function.

lucia.validateSession(sessionId)

Looks in to the database and see if it finds a session with that ID in database and if that is a valid session.  assign this to a variable, here to 'result' (name of any choice) and this variable is returned


const result = await lucia.validateSession(sessionId)
return result;

And this 'result' will be actually also be an object with a user key and a session key.
If its a valid session then we should refresh it, so it is active and user is not suddenly locked out. Therefore we should check if there is a true session on the result object. If we have found an active valid session and we need to check if that session is fresh set to true.
If this conditions satisfied then we need to call 'lucia.createSessionCookie()' and pass argument 'result.session.id'. Thus creating a new session for the session ID of the session we just retrieved. Then we should set that cookie for the existing active session (i.e (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes); ). This will basically recreate that cookie for existing active session and prolong if you say. 

const result = await lucia.validateSession(sessionId);
if(result.session && result.session.fresh){
const sessionCookie = lucia.createSessionCookie(result.session.id);
(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

}
return result;

Next.js will throw an error if we try to set a cookie, if we are doing part of page rendering process an therefore should wrap above it in try catch block. 

const result = await lucia.validateSession(sessionId);
try{
if(result.session && result.session.fresh){
const sessionCookie = lucia.createSessionCookie(result.session.id);
(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}
}
catch{
}
return result;
}

to catch that error and then do nothing because it is a n error we wanna ignore because we want to be able to set the authentication session cookie. Even if we are rendering a page. Next.js does not like it if we set cookies when rendering a page (i.e catch{} ).
It is possible we did not get a session on the result and that case wanna clear the session cookie that was sent along because it is clearly not a cookie for a valid session. Like as follows:-  

if(!result.session){
const sessionCookie = lucia.createBlankSessionCookie();
(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}

And then call '(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes); ' and use the sessionCookie data,  the above code will clear that existing cookie because it contained invalid session data anyways.

verifyAuth() function should be used in any route, any page that actually should be protected and that only should be accessible by logged in users.


lib/auth.js

import { cookies } from 'next/headers';
import { Lucia } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import db from './db';

const adapter = new BetterSqlite3Adapter(db,
{
 user: 'users',
 session: 'sessions'
}
);
const lucia = new Lucia(adapter,
{
  sessionCookie: {
   expires: false,
   attributes: { 
                secure: process.env.NODE_ENV ==production
               } 
	}
});


export async function createAuthSession(userId){
const session = await lucia.createSession(userId, {});
const sessionCookie = lucia.createSessionCookie(session.id);
(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}

export async function verifyAuth(){
const sessionCookie = (await cookies()).get(lucia.sessionCookieName);

if(!sessionCookie)
{
return {
         user: null,
         session: null
};
}

const sessionId = sessionCookie.value;

if(!sessionId)
{
return {
         user: null,
         session: null
};
}

const result = await lucia.validateSession(sessionId);
try{
if(result.session && result.session.fresh){
const sessionCookie = lucia.createSessionCookie(result.session.id);
(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}
if(!result.session){
const sessionCookie = lucia.createBlankSessionCookie();
(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

}
}
catch{
}
return result;
}



Protecting Routes against unauthenticated access

verifyAuth() function can be used in any API routes or any pages which needs to be protected.
Training data need not have to be fetched in the user is not logged in so verifyAuth() function called initially in the below file. 'const result = await verifyAuth();', since verifyAuth() function returns a promise we call 'await' before the verifyAuth() function
This 'result' variable gets an object which has 'user' and 'session' key and corresponding values. If we did not find a valid session for user then the 'user' and 'session' key will have values 'null' each.
If result object contains no user data which indeed mans that request is coming from an unauthenticated user, in that case I want to return and do not use any other code in the 'app/training/page.js'

  if (!result.user) return redirect('/');

In this case do not want to fetch training data and do not want to render and sent back that page, instead I want to redirect to the starting page. SO, the unauthenticated user would not able to visit the training page.



app/training/page.js

import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/auth";
import { getTrainings } from '@/lib/training';

export default async function TrainingPage() {
  const result = await verifyAuth();
  if (!result.user) return redirect('/');

  const trainingSessions = getTrainings();

  return (
    <main>
      <h1>Find your favorite activity</h1>
      <ul id="training-sessions">
        {trainingSessions.map((training) => (
          <li key={training.id}>
            <img src={`/trainings/${training.image}`} alt={training.title} />
            <div>
              <h2>{training.title}</h2>
              <p>{training.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}




Switching Auth Modes with query parameters (search params) 


THe signup and login page is same but if user wants to login, click on the login option in starting page. Similarly, if the user has to signup, click on the signup page without make use know there is change in page.
Swithcing the mode when the button or that link is clicked. We can use 'useState()' hook offered by React to keep track of some mode state (either login or signup). We can change the mode when the link below the form is clicked.
But here we are using search and query params for managing that mode.
When clicking 'Login with existing account' link in the following file 'app/components/auth-form.js', lead the user to the page the user is already on, but I add a query parameter called mode here (i.e /?mode=login), shown below.  

 <Link href="/?mode=login">Login with existing account.</Link>



app/components/auth-form.js

"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signup } from "@/actions/auth-actions";
export default function AuthForm() {
  const [formState, formAction] = useFormState(signup, {});
  return (
    <form id="auth-form" action={formAction}>
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {formState.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}
        </ul>
      )}
      <p>
        <button type="submit">Create Account</button>
      </p>
      <p>
        <Link href="/?mode=login">Login with existing account.</Link>
      </p>
    </form>
  );
}


With Next.js we can easily extract any query and search parameters that might have been set on the page that we are currently on by using a special prop which are added to all page components in Next.js applications.

app/page.js

import AuthForm from '@/components/auth-form';

export default async function Home({searchParams}) {
const formMode = searchParams.mode || 'login';
  return <AuthForm mode={formMode} />;
}


'searchParams' props we get in home page, that is a special prop that is added automatically to all page components in Next.js. It will have an object that has one key for any query parameter that might be set on currently active URL.

'const formMode = searchParams.mode;' here 'mode' is the name we give as search params in the following, in the file 'app/components/auth-form.js'.

 <Link href="/?mode=login">Login with existing account.</Link>

If 'searchParams.mode' does not have value then initial value 'login' will be set 

const formMode = searchParams.mode || 'login';

Now we can pass 'mode' prop into AuthForm component

<AuthForm mode={formMode} />;

So we can destructure the mode prop in 'app/components/auth-form.js' file, (i.e export default function AuthForm({ mode }) )

where this 'mode' prop will have value either 'login' or 'signup'.

{mode === 'login' && <Link href="/?mode=signup">Create an account</Link>}
        {mode === 'signup' && (
          <Link href="/?mode=login">Login with existing account</Link>
        )}



app/components/auth-form.js

"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signup } from "@/actions/auth-actions";
export default function AuthForm({ mode }) {
  const [formState, formAction] = useFormState(signup, {});
  return (
    <form id="auth-form" action={formAction}>
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {formState.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}
        </ul>
      )}
      <p>
       <button type="submit">{mode===login ? 'Login': 'Create Account'}</button>
      </p>
      <p>
        {mode === 'login' && <Link href="/?mode=signup">Create an account</Link>}
        {mode === 'signup' && (
          <Link href="/?mode=login">Login with existing account</Link>
        )}
      </p>
    </form>
  );
}


Adding User login (via server action)



creating a new function called login which is going to get a 'prevState' prop, since login() is a server action function and get 'formData' as second props for login() function.

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
}

we can retrieve email and password in login() function

in this login() function we need not have to check the values match the format of email and password. Because we are going to check if the user is existing User which will check all the criteria was matched during signup 

export function getUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email=?").get(email);
}


lib/user.js

import db from "./db";

export function createUser(email, password) {
  const result = db
    .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
    .run(email, password);
  return result.lastInsertRowid;
}

export function getUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email=?").get(email);
}


So, pass getUserByEmail() function argument with the email we retrieved from the login formData. If 'existingUsers' does exists we sent the error message 


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
}

We can check the password stored in database is correct and matching so we call the 'verifyPassword()' in lib/hash.js file. But since the password is stored in database as hashed form, we recreate hashed password and then compare the stored hashed password to the rehashed supplied password.

lib/hash.js

import crypto from 'node:crypto';

export function hashUserPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');

  const hashedPassword = crypto.scryptSync(password, salt, 64);
  return hashedPassword.toString('hex') + ':' + salt;
}

export function verifyPassword(storedPassword, suppliedPassword) {
  const [hashedPassword, salt] = storedPassword.split(':');
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
  const suppliedPasswordBuf = crypto.scryptSync(suppliedPassword, salt, 64);
  return crypto.timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}



So, create a constant to check if the result of calling verifyPassword() function and in this function we pass 2 argumnets they are existing password and newly entered password in login form. (i.e const isValidPassword = verifyPassword(existingUsers.password, password); ), If the password entered is not valid one then trigger error message.

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
  redirect('/training');
}

In other case we are sure that we passed the email and password entered matches with the email and password stored in database. Then we need to create an auth session and redirect to training page


app/actions/auth-actions.js


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



And in 'app/actions/auth-actions.js' file we are supposed to create a new function auth(), where we get my 'mode' as first argument, 'prevState' as the second argument and 'formData' as the third argument.

export async function auth(mode, prevState, formData) {
  
}

If the mode is 'login' then call login() function, if the mode is 'signup' then call signup() function

export async function auth(mode, prevState, formData) {
  if (mode === login) {
    return login(prevState, formData);
  } else if (mode === signup) {
    return signup(prevState, formData);
  }
}



app/actions/auth-actions.js

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
  if (mode === login) {
    return login(prevState, formData);
  } else if (mode === signup) {
    return signup(prevState, formData);
  }
}


In app/components/auth-form.js file in the useFormstate(), we pass auth() function instead of 'signup' function.

  const [formState, formAction] = useFormState(auth, {});


The auth() function need to get 'mode'. To add extra argument to auth function in useFormstate() function we use 'bind()' method. The first argument to bind() is 'this' value but here 'this' value need not have to be considered so passing null, so the second argument is the value we use bind() for the function auth() to pass argument to auth()

 const [formState, formAction] = useFormState(auth.bind(null, mode), {});



app/components/auth-form.js


"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { auth } from "@/actions/auth-actions";
export default function AuthForm({ mode }) {
  const initialState = {
    errors: {},
  };
  const [formState, formAction] = useFormState(
    auth.bind(null, mode),
    initialState,
  );

  const errors = formState?.errors ?? {};
  return (
    <form id="auth-form" action={formAction}>
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {Object.keys(errors).length > 0 && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}
        </ul>
      )}
      <p>
        <button type="submit">
          {mode === "login" ? "Login" : "Create Account"}
        </button>
      </p>
      <p>
        {mode === "login" && (
          <Link href="/?mode=signup">Create an account</Link>
        )}
        {mode === "signup" && (
          <Link href="/?mode=login">Login with existing account</Link>
        )}
      </p>
    </form>
  );
}



Adding an Auth only Layout


The header to be added to this project and the header will only be visible only if the user is logged in. We cannot add header to the root layout file because header will appear also in login and signup page. So a specific layout for all pages that require user authentication, that requires logged in user. We can add a route group for that under 'app' folder add '(auth)' this is the route group. Route group can be created using brackets like '(auth)'
and the name can be any of choice here I used 'auth'. Then move all pages to this route group which requires a header to be shown in the specific layout written in this route group.
Like 'app/training' to 'app/(auth)/training'. And the specific layout can be app/(auth)/layout.js 
We can group different route pages to this route group. Route group do not add any path segment.




One Root Layout vs Multiple Root Layouts
In the previous lecture, we added the (auth) route group and an auth-only layout (by adding a layout.js file in that (auth) folder).

Currently, this (auth)/layout.js layout will actually not replace the main root layout (i.e., the layout provided by app/layout.js).

Because route group layouts are actually nested into the main root layout unless there is no such root layout. I.e., if you would create another route group (e.g., (unauth)) and move the layout.js file into that folder, you would end up with multiple root layouts.

Therefore, if you're not doing that, you should edit the (auth)/layout.js file and remove the <html> and <body> elements in there. The app will work either way but it's technically incorrect.

Instead, your app/(auth)/layout.js file should look like this:

app/(auth)/layout.js

import '../globals.css';
 
export const metadata = {
  title: 'Next Auth',
  description: 'Next.js Authentication',
};
 
export default function AuthRootLayout({ children }) {
  return (
    <>
      <header id="auth-header">
        <p>Welcome back!</p>
        <form>
          <button>Logout</button>
        </form>
      </header>
      {children}
    </>
  );
}

To log the user out we need to destroy the session that was created. First check if the user has a valid session

 const {session} = await verifyAuth();

If we do not have a session, then there is no session cookie in that case we return an error object

if (!session) {
    return {
      error: "Unauthorized!!",
    };
  }


If we have a session then we need to invalidate the session and destroy the cookie. So we call lucia and call invalidateSession() and pass as argument the session id (i.e await lucia.invalidateSession(session.id) )
This will reach out to session's database table and delete from the session. 
In addition we should clear the session cookie. So does the following

const sessionCookie = lucia.createBlankSessionCookie();
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

destroySession as a full code

export async function destroySession() {
  const { session } = await verifyAuth();
  if (!session) {
    return {
      error: "Unauthorized!!",
    };
  }
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
}



lib/auth.js

import { cookies } from "next/headers";
import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import db from "./db";

const adapter = new BetterSqlite3Adapter(db, {
  user: "users",
  session: "sessions",
});
const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
  },
});

export async function createAuthSession(userId) {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
}

export async function verifyAuth() {
  const sessionCookie = (await cookies()).get(lucia.sessionCookieName);

  if (!sessionCookie) {
    return {
      user: null,
      session: null,
    };
  }

  const sessionId = sessionCookie.value;

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {}
  return result;
}

export async function destroySession() {
  const { session } = await verifyAuth();
  if (!session) {
    return {
      error: "Unauthorized!!",
    };
  }
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
}


And call destroySession and redirect to home page in logout function

export async function logout() {
  destroySession();
  redirect('/');
}



app/auth-actions.js

"use server";

import { createAuthSession, destroySession } from "@/lib/auth";
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

export async function logout() {
  destroySession();
  redirect("/");
}


And call 'logout' function in app/(auth)/layout.js file

 <form action={logout}>
 </form>


app/(auth)/layout.js

import { logout } from "@/actions/auth-actions";
import "../globals.css";

export const metadata = {
  title: "Next Auth",
  description: "Next.js Authentication",
};
export default function AuthRootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header id="auth-header">
          <p>Welcome back</p>
          <form action={logout}>
            <button>Logout</button>
          </form>
        </header>
        {children}
      </body>
    </html>
  );
}

