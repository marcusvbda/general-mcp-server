import { Tool } from "../types.js";

const formula1Tool: Tool = {
    get_F1_Winners: {
        name: "get_F1_Winners",
        description: "Get the winners of the F1 championship.",
        inputSchema: {
            type: "object",
            properties: {
                year: { type: "number" }
            },
            required: ["year"]
        },
        handler: async (args: { year: number }) => {
            const winners: any = {
                '1992': { name: 'Nigel Mansell', team: 'Williams-Renault' },
                '1993': { name: 'Alain Prost', team: 'Williams-Renault' },
                '1994': { name: 'Michael Schumacher', team: 'Benetton-Ford' },
                '1995': { name: 'Michael Schumacher', team: 'Benetton-Renault' },
                '1996': { name: 'Damon Hill', team: 'Williams-Renault' },
                '1997': { name: 'Jacques Villeneuve', team: 'Williams-Renault' },
                '1998': { name: 'Mika Häkkinen', team: 'McLaren-Mercedes' },
                '1999': { name: 'Mika Häkkinen', team: 'McLaren-Mercedes' },
                '2000': { name: 'Michael Schumacher', team: 'Ferrari' },
                '2001': { name: 'Michael Schumacher', team: 'Ferrari' },
                '2002': { name: 'Michael Schumacher', team: 'Ferrari' },
                '2003': { name: 'Michael Schumacher', team: 'Ferrari' },
                '2004': { name: 'Michael Schumacher', team: 'Ferrari' },
                '2005': { name: 'Fernando Alonso', team: 'Renault' },
                '2006': { name: 'Fernando Alonso', team: 'Renault' },
                '2007': { name: 'Kimi Räikkönen', team: 'Ferrari' },
                '2008': { name: 'Lewis Hamilton', team: 'McLaren-Mercedes' },
                '2009': { name: 'Jenson Button', team: 'Brawn GP' },
                '2010': { name: 'Sebastian Vettel', team: 'Red Bull Racing' },
                '2011': { name: 'Sebastian Vettel', team: 'Red Bull Racing' },
                '2012': { name: 'Sebastian Vettel', team: 'Red Bull Racing' },
                '2013': { name: 'Sebastian Vettel', team: 'Red Bull Racing' },
                '2014': { name: 'Lewis Hamilton', team: 'Mercedes' },
                '2015': { name: 'Lewis Hamilton', team: 'Mercedes' },
                '2016': { name: 'Nico Rosberg', team: 'Mercedes' },
                '2017': { name: 'Lewis Hamilton', team: 'Mercedes' },
                '2018': { name: 'Lewis Hamilton', team: 'Mercedes' },
                '2019': { name: 'Lewis Hamilton', team: 'Mercedes' },
                '2020': { name: 'Lewis Hamilton', team: 'Mercedes' },
                '2021': { name: 'Max Verstappen', team: 'Red Bull Racing' },
                '2022': { name: 'Max Verstappen', team: 'Red Bull Racing' },
                '2023': { name: 'Max Verstappen', team: 'Red Bull Racing' },
                '2024': { name: 'Max Verstappen', team: 'Red Bull Racing' },
                '2025': { name: 'Lando Norris', team: 'McLaren-Mercedes' },
            }
            const winner = winners[args.year];
            return {
                content: [
                    { type: "text", text: `The winner of the F1 championship in ${args.year} was ${winner.name} from ${winner.team}` }
                ]
            }
        }
    }
}

export default formula1Tool;