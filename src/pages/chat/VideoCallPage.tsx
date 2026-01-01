import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '../../context/AuthContext';

export const VideoCallPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Meeting Room Setup
  const myMeeting = async (element: HTMLDivElement) => {
    // ⚠️ NOTE: Real apps mein AppID aur ServerSecret backend se aatay hain.
    // Testing ke liye hum yahan Demo Keys use kar rahay hain.
    // Agar ye expire ho jayen, to ZegoCloud par free account bana kar naye le lena.
    
    const appID = 696412493; // Demo App ID
    const serverSecret = "58064d787034e320d7d4982635951662"; // Demo Secret
    
    if (!user || !roomId) return;

    // Token Generate karo
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID, 
      serverSecret, 
      roomId, 
      user.id, 
      user.name
    );

    // Instance create karo
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Room Join karo
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      showScreenSharingButton: true,
      onLeaveRoom: () => {
        navigate('/dashboard/entrepreneur'); // Call katne par wapas Dashboard
      },
    });
  };

  return (
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: '100vw', height: '100vh' }}
    ></div>
  );
};