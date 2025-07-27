export let generalFormat = {
    nameFormat: (name) => {
        if (!name) throw new Error(`Error the name can't be void`)
        return name.toLowerCase()
    },
    documenttypeFormat: (type) => {
        const validTypes = [
            "CC",
            "CE",
            "PP",
            "PEP",
            "NIT"
        ];
        if (!validTypes.includes(type)) throw new Error("You must chosee a document type")
        return type




    },

    identicationFormat: (identification) => {
        if (!identification) throw new Error(`Error the identification can't be void`)
        identification = parseInt(identification)
        if (isNaN(identification)) throw new Error(`Error the identification only can be a number`)
        return parseInt(identification)
    },

    hotmailFormat: (hotmail) => {
        if (!hotmail) throw new Error(`Error: the email can't be empty`);

        const email = hotmail.toLowerCase().trim();

        // Validación con expresión regular
        const emailRegex = /^[^\s()<>[\]{};:,"']+@[^\s()<>[\]{};:,"']+\.[^\s()<>[\]{};:,"']+$/;

        if (!emailRegex.test(email)) {
            throw new Error(`Error: invalid email format. Make sure it includes a domain, e.g., 'example@hotmail.com'`);
        }

        return email;
    },

    passwordFormat: (password1, password2) => {
        if (!password1 || !password2) throw new Error(`Error: password can't be empty`);
        if (password1 !== password2) throw new Error(`Error: passwords must match`);

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        if (!regex.test(password1)) {
            throw new Error(`Password must have at least 8 characters, including:
                - one uppercase letter
                - one lowercase letter
                - one number
                - one special character`);
        }

        return password1;
    }
}






