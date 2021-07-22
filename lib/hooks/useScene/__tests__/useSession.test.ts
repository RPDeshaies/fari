import { act, renderHook } from "@testing-library/react-hooks";
import Peer from "peerjs";
import {
  ILineObject,
  ObjectType,
} from "../../../components/DrawArea/hooks/useDrawing";
import { useCharacters } from "../../../contexts/CharactersContext/CharactersContext";
import { ISession } from "../IScene";
import { useSession } from "../useSession";

describe("useSession", () => {
  it("constructor", () => {
    // GIVEN
    const userId = "111";
    const useCharactersMock = mockUseCharacters();

    const expectDefaultSession: ISession = {
      gm: {
        id: expect.anything(),
        playerName: "Game Master",
        rolls: [],
        playedDuringTurn: false,
        npcs: [],
        isGM: true,
        points: "3",
      },
      players: [],
      goodConfetti: 0,
      badConfetti: 0,
      drawAreaObjects: [],
    };
    // WHEN
    const { result } = renderHook(() => {
      const charactersManager = useCharactersMock();
      return useSession({
        userId,
        charactersManager,
      });
    });
    // THEN
    expect(result.current.state.session).toEqual(expectDefaultSession);
  });

  describe("players", () => {
    it("should map connections to players", () => {
      // GIVEN
      const userId = "111";
      const useCharactersMock = mockUseCharacters();

      // WHEN initial render
      const { result } = renderHook(() => {
        const charactersManager = useCharactersMock();
        return useSession({
          userId,
          charactersManager,
        });
      });
      // WHEN initial connection with a player
      act(() => {
        result.current.actions.updatePlayersWithConnections([
          {
            label: "1",
            metadata: {
              playerName: "RP",
            },
          },
        ] as Array<Peer.DataConnection>);
      });
      // THEN
      expect(result.current.state.session.players[0]).toEqual({
        character: undefined,
        id: "1",
        isGM: false,
        points: "3",
        playedDuringTurn: false,
        offline: false,
        playerName: "RP",
        rolls: [],
      });
      // WHEN player plays (fp, rolls, initiative)
      act(() => {
        result.current.actions.updatePlayerPlayedDuringTurn("1", true);
        result.current.actions.updatePlayerRoll("1", {
          rollGroups: [
            {
              commandSets: [
                {
                  id: "4dF",
                  commands: [
                    { value: 1, name: "1dF" },
                    { value: 1, name: "1dF" },
                    { value: 1, name: "1dF" },
                    { value: 1, name: "1dF" },
                  ],
                },
              ],
            },
          ],

          total: 4,
          totalWithoutModifiers: 4,
          options: { listResults: false },
        });
        result.current.actions.updatePlayerCharacterMainPointCounter(
          "1",
          "1",
          "3"
        );
      });
      // THEN connection mappings reflects that
      expect(result.current.state.session.players[0]).toEqual({
        character: undefined,
        id: "1",
        playedDuringTurn: true,
        isGM: false,
        points: "1",
        offline: false,
        playerName: "RP",
        rolls: [
          {
            rollGroups: [
              {
                commandSets: [
                  {
                    id: "4dF",
                    commands: [
                      { value: 1, name: "1dF" },
                      { value: 1, name: "1dF" },
                      { value: 1, name: "1dF" },
                      { value: 1, name: "1dF" },
                    ],
                  },
                ],
              },
            ],
            options: {
              listResults: false,
            },
            total: 4,
            totalWithoutModifiers: 4,
          },
        ],
      });
      act(() => {
        // WHEN reseting initiative
        result.current.actions.resetInitiative();
      });
      // THEN initiative is reset
      expect(result.current.state.session.players[0]).toEqual({
        character: undefined,
        id: "1",
        playedDuringTurn: false,
        isGM: false,
        points: "1",
        offline: false,
        playerName: "RP",
        rolls: [
          {
            rollGroups: [
              {
                commandSets: [
                  {
                    id: "4dF",
                    commands: [
                      { value: 1, name: "1dF" },
                      { value: 1, name: "1dF" },
                      { value: 1, name: "1dF" },
                      { value: 1, name: "1dF" },
                    ],
                  },
                ],
              },
            ],
            options: {
              listResults: false,
            },
            total: 4,
            totalWithoutModifiers: 4,
          },
        ],
      });
      act(() => {
        // WHEN player adds character sheet
        result.current.actions.updatePlayerCharacter("1", {
          myCharacter: "my first character",
        } as unknown as any);
      });
      // THEN player as character
      expect(result.current.state.session.players[0].character).toEqual({
        myCharacter: "my first character",
      });
      act(() => {
        // WHEN player reloads character sheet
        result.current.actions.updatePlayerCharacter("1", {
          myCharacter: "my second character",
        } as unknown as any);
      });
      // THEN player as character
      expect(result.current.state.session.players[0].character).toEqual({
        myCharacter: "my second character",
      });

      act(() => {
        // WHEN player reloads character sheet
        result.current.actions.updatePlayerCharacter("1", {
          myCharacter: "my second character",
        } as unknown as any);
      });
      // THEN player as character
      expect(result.current.state.session.players[0].character).toEqual({
        myCharacter: "my second character",
      });
    });
    describe("removePlayers sticky connections", () => {
      it("should keep removed players out", () => {
        // GIVEN
        const userId = "111";
        const useCharactersMock = mockUseCharacters();

        // WHEN initial render
        const { result } = renderHook(() => {
          const charactersManager = useCharactersMock();
          return useSession({
            userId,
            charactersManager,
          });
        });
        // WHEN initial connection with a player
        act(() => {
          result.current.actions.updatePlayersWithConnections([
            {
              label: "1",
              metadata: {
                playerName: "RP",
              },
            },
            {
              label: "2",
              metadata: {
                playerName: "Xav Bad Connection",
              },
            },
          ] as Array<Peer.DataConnection>);
        });
        // THEN I should have 2 players
        expect(result.current.state.session.players).toEqual([
          {
            character: undefined,
            id: "1",
            playedDuringTurn: false,
            offline: false,
            isGM: false,
            points: "3",
            playerName: "RP",
            rolls: [],
          },
          {
            character: undefined,
            id: "2",
            playedDuringTurn: false,
            offline: false,
            isGM: false,
            points: "3",
            playerName: "Xav Bad Connection",
            rolls: [],
          },
        ]);

        // WHEN I kick a bad connection
        act(() => {
          result.current.actions.removePlayer("2");
        });

        // THEN I only have one player
        expect(result.current._.removedPlayers).toEqual(["2"]);
        expect(result.current.state.session.players).toEqual([
          {
            character: undefined,
            id: "1",
            playedDuringTurn: false,
            isGM: false,
            points: "3",
            offline: false,
            playerName: "RP",
            rolls: [],
          },
        ]);

        // WHEN the bad connection joins with a new id
        act(() => {
          result.current.actions.updatePlayersWithConnections([
            {
              label: "1",
              metadata: {
                playerName: "RP",
              },
            },
            {
              label: "2",
              metadata: {
                playerName: "Xav Bad Connection",
              },
            },
            {
              label: "3",
              metadata: {
                playerName: "Xav GOOD",
              },
            },
          ] as Array<Peer.DataConnection>);

          // THEN I only have two player
          expect(result.current.state.session.players).toEqual([
            {
              character: undefined,
              id: "1",
              offline: false,
              isGM: false,
              points: "3",
              playedDuringTurn: false,
              playerName: "RP",
              rolls: [],
            },
          ]);
        });
      });
    });
  });

  describe("draw area", () => {
    // GIVEN
    const userId = "111";
    const useCharactersMock = mockUseCharacters();

    // WHEN initial render
    const { result } = renderHook(() => {
      const charactersManager = useCharactersMock();
      return useSession({
        userId,

        charactersManager,
      });
    });
    expect(result.current.state.session.drawAreaObjects).toEqual([]);
    // WHEN drawing
    act(() => {
      result.current.actions.updateDrawAreaObjects([
        { color: "", points: [], type: ObjectType.Line } as ILineObject,
      ]);
    });
    // THEN
    expect(result.current.state.session.drawAreaObjects).toEqual([
      { color: "", points: [], type: ObjectType.Line },
    ]);
  });
  describe("confetti", () => {
    // GIVEN
    const userId = "111";
    const useCharactersMock = mockUseCharacters();

    // WHEN initial render
    const { result } = renderHook(() => {
      const charactersManager = useCharactersMock();
      return useSession({
        userId,

        charactersManager,
      });
    });
    expect(result.current.state.session.goodConfetti).toEqual(0);
    expect(result.current.state.session.badConfetti).toEqual(0);

    // WHEN good confetti
    act(() => {
      result.current.actions.fireGoodConfetti();
    });
    // THEN
    expect(result.current.state.session.goodConfetti).toEqual(0);
    expect(result.current.state.session.badConfetti).toEqual(0);
    // WHEN bad confetti
    act(() => {
      result.current.actions.fireBadConfetti();
    });
    // THEN
    expect(result.current.state.session.goodConfetti).toEqual(0);
    expect(result.current.state.session.badConfetti).toEqual(0);
  });

  describe("overrideSession", () => {
    // GIVEN
    const userId = "111";
    const useCharactersMock = mockUseCharacters();

    // WHEN initial render
    const { result } = renderHook(() => {
      const charactersManager = useCharactersMock();
      return {
        useSession: useSession({
          userId,
          charactersManager,
        }),
        useCharacters: charactersManager,
      };
    });
    // WHEN safeSet with nothing
    act(() => {
      result.current.useSession.actions.overrideSession(
        undefined as unknown as any
      );
    });

    // WHEN safeSet
    act(() => {
      result.current.useSession.actions.overrideSession({
        gm: { npcs: [] },
        players: [{ character: {} }, { character: {} }],
      } as unknown as any);
    });

    // THEN
    expect(result.current.useSession.state.session).toEqual({
      gm: { npcs: [] },
      players: [{ character: {} }, { character: {} }],
    });
    expect(
      result.current.useCharacters.actions.updateIfMoreRecent
    ).toHaveBeenCalledTimes(2);
  });

  describe("offline character", () => {
    const userId = "111";
    const useCharactersMock = mockUseCharacters();

    // WHEN initial render
    const { result } = renderHook(() => {
      const charactersManager = useCharactersMock();
      return useSession({
        userId,
        charactersManager,
      });
    });
    // WHEN adding an offline character
    let playerId = "";
    act(() => {
      playerId = result.current.actions.addOfflinePlayer();
    });
    // THEN
    expect(result.current.state.session.gm.npcs).toEqual([
      {
        character: undefined,
        points: "3",
        id: playerId,
        playedDuringTurn: false,
        isGM: false,

        playerName: "Character #1",
        rolls: [],
      },
    ]);
    // WHEN removing an offline player
    act(() => {
      result.current.actions.removePlayer(playerId);
    });
    // THEN
    expect(result.current.state.session.gm.npcs).toEqual([]);
  });
});

function mockUseCharacters() {
  const result = {
    state: {
      characters: [],
      groups: [],
    },
    actions: {
      add: jest.fn(),
      upsert: jest.fn(),
      updateIfMoreRecent: jest.fn(),
      addIfDoesntExist: jest.fn(),
      remove: jest.fn(),
      duplicate: jest.fn(),
      select: jest.fn(),
      clearSelected: jest.fn(),
      exportEntity: jest.fn(),
      importEntity: jest.fn(),
      exportEntityAsTemplate: jest.fn(),
    },
    selectors: {
      isInStorage: jest.fn(),
    },
  } as ReturnType<typeof useCharacters>;
  return () => {
    return result;
  };
}
