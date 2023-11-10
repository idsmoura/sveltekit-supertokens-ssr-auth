import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import ThirdPartyEmailPassword, {
	emailPasswordSignIn
} from 'supertokens-web-js/recipe/thirdpartyemailpassword';
import { emailPasswordSignUp } from 'supertokens-web-js/recipe/thirdpartyemailpassword';
import { goto } from '$app/navigation';
import { VITE_API_BASE_URL, VITE_SUPERTOKENS_APP_NAME } from '$lib/env';
export const supertokensInit = () => {
	SuperTokens.init({
		appInfo: {
			apiDomain: VITE_API_BASE_URL as string,
			apiBasePath: '/auth',
			appName: VITE_SUPERTOKENS_APP_NAME as string
		},
		recipeList: [
			Session.init({
				autoAddCredentials: true
			}),
			ThirdPartyEmailPassword.init()
		]
	});
};

export const signupWithEmailAndPassword = async (email: string, password: string) => {
	let emailErrors: string[] = [];
	let passwordErrors: string[] = [];

	try {
		const response = await emailPasswordSignUp({
			formFields: [
				{
					id: 'email',
					value: email
				},
				{
					id: 'password',
					value: password
				}
			]
		});

		if (response.status === 'FIELD_ERROR') {
			response.formFields?.forEach((field) => {
				if (field.id == 'email') {
					emailErrors = emailErrors.concat(field.error);
				}
				if (field.id == 'password') {
					passwordErrors = passwordErrors.concat(field.error);
				}
			});
			return { emailErrors, passwordErrors };
		} else {
			await goto('/', { invalidateAll: true });
		}
	} catch (err: any) {
		// TODO handle error
		console.log(err);
	}

	return { emailErrors, passwordErrors };
};

export const signinWithEmailAndPassword = async (email: string, password: string) => {
	try {
		const response = await emailPasswordSignIn({
			formFields: [
				{
					id: 'email',
					value: email
				},
				{
					id: 'password',
					value: password
				}
			]
		});

		let emailErrors: string[] = [];
		let passwordErrors: string[] = [];
		if (response.status === 'FIELD_ERROR') {
			response.formFields?.forEach((field) => {
				if (field.id == 'email') {
					emailErrors = emailErrors.concat(field.error);
				}
				if (field.id == 'password') {
					passwordErrors = passwordErrors.concat(field.error);
				}
			});
		} else if (response.status === 'WRONG_CREDENTIALS_ERROR') {
			// TODO display error
			passwordErrors = passwordErrors.concat('Email password combination is incorrect.');
		} else {
			goto('/');
		}
		return { emailErrors, passwordErrors };
	} catch (err: any) {
		// TODO handle error
		console.log(err);
	}
};

export const logout = async () => {
	await Session.signOut();
	goto('/signin');
};
