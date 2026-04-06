/**
 * Defines the roles that players can have in the game.
 * Host: The player who creates the game and has control over starting and resetting the game.
 * Controller: Players who join the game and can move around and interact with the game environment.
 */
export enum Role {
    Host = 'host',
    Controller = 'controller'
}