const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, './src/pages/**/*.{js,ts,jsx,tsx}'),
    join(__dirname, './src/components/**/*.{js,ts,jsx,tsx}'),
  ],
  darkMode: "class",
  plugins: [require("@tailwindcss/typography")],
  theme: {
    fontFamily: {
      sourcecodepro:
        "'Source Code Pro', 'ui-monospace', 'SFMono-Regular', monospace",
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            ul: {
              li: {
                "&::marker": {
                  content: '"-"',
                },
              },
            },
            /* input: { //Doesnt work cause inputs cant have ::before and ::after you dummy!
                          '&[type="checkbox"]': {
                              color: "#ff0",
                              before: {
                                  content: '"["'
                              },
                              after: {
                                  content: '"]"'
                              },
                          }
                      } */
            ":not(pre) > code": {
              "background-color": "rgba(230,230,230,.75)",
              "border-radius": ".25rem",
              padding: ".3rem .5rem",
              "&::before, &::after": {
                content: '""',
              },
            },

            ".dark :not(pre) > code": {
              "background-color": "rgba(100,100,100,.85)",
            },

            // ':not(pre) > code': {
            //     'background-color': "rgba(230,230,230,.75)",
            //     'background-opacity': "50%",
            //     'border-radius': '.25rem',
            //     padding: '.17rem',
            //     '&::before, &::after': {
            //         color: 'red'
            //     }
            // },
          },
        },
      },
    },
  },
};
