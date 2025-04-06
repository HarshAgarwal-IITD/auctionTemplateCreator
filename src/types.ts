export interface Player {
  name: string;
  hostel: string;
  experience: string;
  degree: string;
  photo: string;
  sold:boolean
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  playerName: string;
  playerHostel: string;
  playerExp: string;
  players: Player[];
  currentIndex: number;
  onChangePlayer: (index: number) => void;
  sold:boolean;
  setPlayers:Function
}
