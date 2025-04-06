import React, { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Player, ModalProps } from './types';
   
function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  playerName,
  playerHostel,
  playerExp,
  players,
  currentIndex,
  onChangePlayer,
  sold,setPlayers
}: ModalProps) {
  if (!isOpen) return null;

  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + players.length) % players.length;
    onChangePlayer(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % players.length;
    onChangePlayer(newIndex);
  };
  const handleUpdate=()=>{
    localStorage.setItem("data",JSON.stringify(players))
  }
  return (
    <div className="fixed h-screen w-screen inset-0 bg-black  z-50 flex items-center justify-center p-4">
      <div className="relative max-w-7xl w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X className="w-8 h-8" />
        </button>

        <img
          src={imageUrl}
          alt={playerName}
          className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80';
          }}
        />

        {/* Carousel Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow-md"
        >
          ◀
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow-md"
        >
          ▶
        </button>
          
        {!sold ? (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-lg p-4 shadow-lg">
            <p className="text-gray-800 text-xl font-semibold">{playerName}</p>
            <p className="text-gray-600 text-lg mt-1">
              <span className="font-semibold">Hostel:</span> {playerHostel}
            </p>
            <p className="text-gray-600 text-lg mt-1">
              <span className="font-semibold">Experience:</span> {playerExp}
            </p>
            <button
              onClick={() => {
          const updatedPlayers = [...players];
          updatedPlayers[currentIndex].sold = true;
          setPlayers(updatedPlayers); // Update state with new array
          onChangePlayer(currentIndex); // Trigger re-render
          console.log(players[currentIndex].sold )
          handleUpdate();
              }}
              className="mt-2 bg-white text-red-500 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-100"
            >
              Mark as Sold
            </button>
           
          </div>
        ) : (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 bg-opacity-90 rounded-lg p-4 shadow-lg">
            <p className="text-white text-6xl font-semibold">Sold</p>
            <button    onClick={() => {
          const updatedPlayers = [...players];
          updatedPlayers[currentIndex].sold = false;
          setPlayers(updatedPlayers); // Update state with new array
          onChangePlayer(currentIndex); // Trigger re-render
          console.log(players[currentIndex].sold )
          handleUpdate();
              }}   className="mt-2 flex  bg-white text-red-500 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-100">Unsell</button>
            
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);

  useEffect(()=>{
    if(localStorage.getItem('data')){
      setPlayers(JSON.parse(localStorage.getItem('data') as string))
    }
  },[])
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
      console.log(jsonData)

      const formattedPlayers: Player[] = jsonData.map(row => ({
        name: row['Name'] || '',
        hostel: row['Hostel'] || '',
        experience: row['Experience'] || '',
        degree: row['Degree'] || '',
        photo:getGoogleDriveImageUrl(row["Photo "]) || '',
        sold:false
      }));
      console.log(formattedPlayers)

      setPlayers(formattedPlayers);
    
      localStorage.setItem('data',JSON.stringify(formattedPlayers));
    };
    reader.readAsBinaryString(file);
  };
  const getGoogleDriveImageUrl = (url: string): string => {
    if (!url) return '';
    
    try {
      // Extract file ID from various Google Drive URL formats
      let fileId = '';
      
      if (url.includes('drive.google.com/file/d/')) {
        fileId = url.split('/file/d/')[1].split('/')[0];
      } else if (url.includes('drive.google.com/open?id=')) {
        fileId = url.split('open?id=')[1].split('&')[0];
      } else if (url.includes('drive.google.com/uc?')) {
        fileId = url.split('id=')[1].split('&')[0];
      } else if (url.includes('id=')) {
        fileId = url.split('id=')[1].split('&')[0];
      }
      
      if (!fileId) return url;
      
      // Try different Google Drive URL formats (in order of reliability)
      
      // Format 1: Drive User Content download with export=view
      return `https://drive.google.com/thumbnail?id=${fileId}`;
      
      // Alternative formats to try if the above doesn't work:
      // Format 2: Drive User Content download with export=download
      // return `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
      
      // Format 3: Original "uc" format
      // return `https://drive.google.com/uc?export=view&id=${fileId}`;
      
      // Format 4: Direct "thumbnail" version (works for images, but lower quality)
      // return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    } catch (error) {
      console.error('Error formatting Google Drive URL:', error);
      return url || '';
    }
  };
      // If it's another format but has a file ID, extract and convert
     
  

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white  rounded-lg shadow-lg p-6 mb-8">
          <div className=' flex flex-row justify-between'>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Player Auction Dashboard</h1>
          <button onClick={()=>{
            localStorage.removeItem("data");
            setPlayers([]);

          }}
          className=' bg-red-500 p-4 m-2 rounded-lg text-gray-100'>
            Delete</button>  
          </div>        
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">XLSX, XLS</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div 
                className="aspect-w-16 aspect-h-9 cursor-pointer"
                onClick={() => setSelectedPlayerIndex(index)}
              >
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full h-64 object-cover transition-transform hover:scale-105"
                  onError={(e)=>{console.log(e)}}
                 
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{player.name}</h3>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Hostel:</span> {player.hostel}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Degree:</span> {player.degree}
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Basketball Experience:</h4>
                  <p className="text-gray-600">{player.experience}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPlayerIndex !== null && (
  <ImageModal
    isOpen={true}
    onClose={() => setSelectedPlayerIndex(null)}
    imageUrl={players[selectedPlayerIndex].photo}
    playerName={players[selectedPlayerIndex].name}
    playerHostel={players[selectedPlayerIndex].hostel}
    playerExp={players[selectedPlayerIndex].experience}
    players={players}
    currentIndex={selectedPlayerIndex}
    onChangePlayer={setSelectedPlayerIndex}
    sold={players[selectedPlayerIndex].sold}
    setPlayers={setPlayers}
  />
)}

    </div>
  );
}

export default App;