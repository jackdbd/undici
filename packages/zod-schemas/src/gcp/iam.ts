import { z } from 'zod'

export const service_account_json_key_filepath = z
  .string()
  .min(1)
  .default(process.env.GOOGLE_APPLICATION_CREDENTIALS || '')
  // .regex(new RegExp('^.*\.json$'))
  .describe('Filepath to the JSON key representing a GCP service account')

export const service_account_email = z
  .string()
  .email()
  .min(1)
  .regex(new RegExp('^.*iam.gserviceaccount.com$'))
  .describe('Email of a GCP service account')

export const google_group_email = z
  .string()
  .email()
  .min(1)
  .describe('Email of a Google Group')

export const user_email = z
  .string()
  .email()
  .min(1)
  .describe('Email of a Google physical user')

export const client_email = z
  .union([service_account_email, google_group_email, user_email])
  .describe('Email of a Google identity')

export const private_key = z
  .string()
  .min(1)
  .regex(new RegExp('-----BEGIN PRIVATE KEY-----'))
  .regex(new RegExp('-----END PRIVATE KEY-----'))
  .describe('Private key of a GCP service account')

export const client_credentials = z
  .object({
    client_email,
    private_key
  })
  .describe('OAuth 2.0 credentials of a GCP service account')

export type ClientCredentials = z.infer<typeof client_credentials>
