import bcrypt from "bcrypt"

export const bcrpytMethods = {
    hashPassword: async (password: string): Promise<string> => {
        const salt = await bcrypt.genSalt(12)
        return bcrypt.hash(password, salt)
    },

    comparePassword: async (password: string, hashedPassword: string): Promise<boolean> => {
        return await bcrypt.compare(password, hashedPassword)
    }
}