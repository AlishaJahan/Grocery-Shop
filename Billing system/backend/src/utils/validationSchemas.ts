import * as yup from 'yup';

export const registerSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .required('Email is required')
            .email('Invalid email format')
            .matches(
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                'Please enter a valid email address'
            ),
        password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    }),
});

export const loginSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .required('Email is required')
            .email('Invalid email format')
            .matches(
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                'Please enter a valid email address'
            ),
        password: yup.string().required('Password is required'),
    }),
});
