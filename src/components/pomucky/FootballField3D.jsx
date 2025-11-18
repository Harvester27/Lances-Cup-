// src/FootballField3D.jsx
import React, { useEffect, useRef, useState } from 'react';

import { FootballFieldCore } from './FootballFieldCore.js';

import { 
  GameMenu, 
  StadiumEditorPanel, 
  GameControlsPanel, 
  DribblingIndicator, 
  BackToMenuButton,
  KickCooldownIndicator,
  CameraIndicator,
  GameStatusPanel,
  BallControlIndicator,
  GameMessageSystem,
  ShootingIndicator,
  UnsavedChangesIndicator
} from './UIComponents.jsx';

import { PlayerStatsOverlay } from './GameUI.jsx';
import { CameraControlPanel } from './CameraControlPanel.jsx';
import { firebaseManager } from './FirebaseManager.js';
import { LoginScreen } from './LoginScreen.jsx';
import { playerDataManager } from './PlayerDataManager.js';
import { OfflineLeagueMenu } from './OfflineLeagueMenu.jsx';
import { MatchSetupScreen } from './MatchSetupScreen.jsx';
import MatchTimer from './MatchTimer.jsx';
import { matchManager } from './MatchManager.js';

if (typeof window !== 'undefined') {
  if (!window.firebaseManager && firebaseManager) {
    window.firebaseManager = firebaseManager;
  }
  if (!window.playerDataManager && playerDataManager) {
    window.playerDataManager = playerDataManager;
  }
}

export default function FootballField3D() {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const ballRef = useRef(null);
  const aiPlayerRef = useRef(null);
  const aiControllerRef = useRef(null);
  const coreRef = useRef(null);
  const managersRef = useRef({});
  
  const [isFirstPerson, setIsFirstPerson] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDribbling, setIsDribbling] = useState(false);
  const [kickCooldown, setKickCooldown] = useState(0);
  const [gameState, setGameState] = useState('menu');
  const [currentAIOpponent, setCurrentAIOpponent] = useState(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [stadiumElements, setStadiumElements] = useState([]);
  const [selectedTool, setSelectedTool] = useState('small_stand');
  const [placementMode, setPlacementMode] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [editMode, setEditMode] = useState('place');
  const [previewPosition, setPreviewPosition] = useState(null);
  const [isValidPlacement, setIsValidPlacement] = useState(true);
  const [previewRotation, setPreviewRotation] = useState(0);
  
  const [seatOptions, setSeatOptions] = useState({
    type: 'plastic',
    color: 'blue',
    placementMode: 'single'
  });
  const [selectedStairs, setSelectedStairs] = useState(null);
  const [seatDetailMode, setSeatDetailMode] = useState(false);
  const [originalCameraPosition, setOriginalCameraPosition] = useState(null);

  const [mouseOffsetX, setMouseOffsetX] = useState(0);
  const [targetCameraRotationY, setTargetCameraRotationY] = useState(0);

  const [manualCameraMode, setManualCameraMode] = useState(false);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 35, z: 50 });
  const [cameraZoom, setCameraZoom] = useState(1.0);

  const getUserControlledCamera = () => {
    return coreRef.current?.getUserControlledCamera() || false;
  };

  const resetCameraControl = () => {
    if (coreRef.current) {
      coreRef.current.resetCameraControl();
    }
  };

  useEffect(() => {
    if (playerDataManager && !window.playerDataManager) {
      window.playerDataManager = playerDataManager;
    }
  }, []);

  useEffect(() => {
    let unsubscribe;
    
    try {
      const connectionInfo = firebaseManager.getConnectionInfo();
      
      unsubscribe = firebaseManager.setOnUserChanged((user) => {
        setCurrentUser(user);
        setIsAuthenticated(!!user);
        setAuthLoading(false);
      });
      
      const currentFirebaseUser = firebaseManager.getCurrentUser();
      setCurrentUser(currentFirebaseUser);
      setIsAuthenticated(!!currentFirebaseUser);
      setAuthLoading(false);
      
    } catch (error) {
      console.error("Firebase setup error:", error);
      setAuthLoading(false);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (gameState === 'editor' && stadiumElements && playerDataManager?.stadiumManager) {
      playerDataManager.stadiumManager.updateStadiumElements(stadiumElements);
    }
  }, [stadiumElements, gameState]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    setTimeout(() => {
      // Transition to main menu
    }, 500);
  };

  const startOfflineLeague = () => {
    setGameState('offlineLeague');
  };

  const startMatchSetup = (matchType) => {
    setGameState('matchSetup');
  };

  const startOfflineMatch = (aiOpponent) => {
    setCurrentAIOpponent(aiOpponent);
    window.currentAIOpponent = aiOpponent;
    setGameState('playing');
  };

  const handleMatchEnd = (data) => {
    const resultMessage = data.result === 'win' ? '🏆 VÝHRA!' : 
                         data.result === 'lose' ? '😞 PROHRA' : 
                         '🤝 REMÍZA';
    
    if (window.showGameMessage) {
      window.showGameMessage(
        `${resultMessage} Skóre: ${data.score.player}-${data.score.opponent}`,
        data.result === 'win' ? 'success' : data.result === 'lose' ? 'error' : 'info',
        5000
      );
    }
    
    setTimeout(() => {
      setGameState('menu');
      setCurrentAIOpponent(null);
      matchManager.resetMatch();
    }, 5000);
  };

  const handleGoalScored = (data) => {
    const goalMessage = data.team === 'player' ? 
      `⚽ GÓL! Tvoje skóre: ${data.score.player}-${data.score.opponent}` :
      `😞 Soupeř skóroval: ${data.score.player}-${data.score.opponent}`;
    
    if (window.showGameMessage) {
      window.showGameMessage(
        goalMessage,
        data.team === 'player' ? 'success' : 'warning',
        3000
      );
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && currentAIOpponent) {
      matchManager.addEventListener('matchEnd', handleMatchEnd);
      matchManager.addEventListener('goalScored', handleGoalScored);
      
      const autoStartTimeout = setTimeout(() => {
        const started = matchManager.startMatch();
        if (!started) {
          console.error("Failed to start AI match");
        }
      }, 2000);
      
      let matchUpdateInterval;
      if (matchManager) {
        matchUpdateInterval = setInterval(() => {
          if (matchManager.isMatchRunning()) {
            matchManager.update(1/60);
          }
        }, 1000/60);
      }
      
      return () => {
        matchManager.removeEventListener('matchEnd', handleMatchEnd);
        matchManager.removeEventListener('goalScored', handleGoalScored);
        clearTimeout(autoStartTimeout);
        
        if (matchUpdateInterval) {
          clearInterval(matchUpdateInterval);
        }
        
        if (matchManager.isMatchRunning()) {
          matchManager.resetMatch();
        }
      };
    }
  }, [gameState, currentAIOpponent]);

  const backToMenuCallback = () => {
    setGameState('menu');
    setIsFirstPerson(false);
    setIsDribbling(false);
    setKickCooldown(0);
    setPlacementMode(false);
    setEditMode('place');
    setSelectedObject(null);
    setPreviewPosition(null);
    setPreviewRotation(0);
    setMouseOffsetX(0);
    setTargetCameraRotationY(0);
    setSeatDetailMode(false);
    setSelectedStairs(null);
    setOriginalCameraPosition(null);
    setManualCameraMode(false);
    setCameraPosition({ x: 0, y: 35, z: 50 });
    setCameraZoom(1.0);
    setCurrentAIOpponent(null);
    if (window.currentAIOpponent) {
      window.currentAIOpponent = null;
    }
    if (coreRef.current) {
      coreRef.current.clearCameraState();
    }
    if (matchManager.isMatchRunning()) {
      matchManager.resetMatch();
    }
  };

  useEffect(() => {
    if (!mountRef.current || (gameState !== 'playing' && gameState !== 'editor')) return;

    if (!coreRef.current) {
      coreRef.current = new FootballFieldCore();
    }

    const stateSetters = {
      setGameState,
      setIsFirstPerson,
      setShowControls,
      setIsDribbling,
      setKickCooldown,
      setStadiumElements,
      setSelectedTool,
      setPlacementMode,
      setSelectedObject,
      setEditMode,
      setPreviewPosition,
      setIsValidPlacement,
      setPreviewRotation,
      setSeatOptions,
      setSelectedStairs,
      setSeatDetailMode,
      setOriginalCameraPosition,
      setMouseOffsetX,
      setTargetCameraRotationY,
      setManualCameraMode,
      showControls,
      isDribbling,
      kickCooldown
    };

    const managers = coreRef.current.initializeField(
      mountRef, gameState, isFirstPerson, stadiumElements, selectedTool, placementMode,
      editMode, selectedObject, previewPosition, isValidPlacement, previewRotation,
      seatOptions, selectedStairs, seatDetailMode, originalCameraPosition, mouseOffsetX,
      targetCameraRotationY, manualCameraMode, cameraPosition, setCameraPosition,
      cameraZoom, setCameraZoom, playerRef, ballRef, backToMenuCallback,
      stateSetters, currentAIOpponent
    );

    if (managers) {
      managersRef.current = managers;
      aiPlayerRef.current = managers.aiPlayer;
      aiControllerRef.current = managers.aiController;
    }

    return () => {
      if (coreRef.current) {
        coreRef.current.dispose();
      }
      
      if (mountRef.current && managersRef.current?.sceneSetup?.renderer) {
        const renderer = managersRef.current.sceneSetup.renderer;
        if (mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      
      playerRef.current = null;
      ballRef.current = null;
      aiPlayerRef.current = null;
      aiControllerRef.current = null;
      managersRef.current = {};
    };
  }, [
    gameState, 
    isFirstPerson, 
    stadiumElements, 
    selectedTool, 
    placementMode, 
    editMode, 
    selectedObject, 
    seatOptions, 
    seatDetailMode,
    manualCameraMode,
    currentAIOpponent
  ]);

  useEffect(() => {
    const handleCustomizationChange = () => {
      if (playerRef.current?.refreshAppearance) {
        playerRef.current.refreshAppearance();
      }
    };
    
    const handleAttributesChange = () => {
      if (playerRef.current?.refreshAttributes) {
        playerRef.current.refreshAttributes();
      }
    };
    
    const handleDataLoaded = () => {
      if (playerRef.current?.refreshAppearance) {
        playerRef.current.refreshAppearance();
      }
      if (playerRef.current?.refreshAttributes) {
        playerRef.current.refreshAttributes();
      }
    };
    
    playerDataManager.addEventListener('customizationChanged', handleCustomizationChange);
    playerDataManager.addEventListener('attributesUpdated', handleAttributesChange);
    playerDataManager.addEventListener('dataLoaded', handleDataLoaded);
    
    return () => {
      playerDataManager.removeEventListener('customizationChanged', handleCustomizationChange);
      playerDataManager.removeEventListener('attributesUpdated', handleAttributesChange);
      playerDataManager.removeEventListener('dataLoaded', handleDataLoaded);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'editor' && managersRef.current?.manualCameraController) {
      const updateCameraInfo = () => {
        const pos = managersRef.current.manualCameraController.getCameraPosition();
        const zoom = managersRef.current.manualCameraController.getCameraZoom();
        setCameraPosition(pos);
        setCameraZoom(zoom);
      };
      
      let intervalId;
      if (manualCameraMode) {
        intervalId = setInterval(updateCameraInfo, 100);
      }
      
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  }, [gameState, manualCameraMode]);

  useEffect(() => {
    if (editMode === 'place' && placementMode && managersRef.current?.stadiumManager) {
      managersRef.current.stadiumManager.resetPreviewRotation();
      setPreviewRotation(0);
      managersRef.current.stadiumManager.clearPreview();
      setPreviewPosition(null);
    }
  }, [selectedTool, placementMode, editMode]);

  useEffect(() => {
    if (editMode !== 'seat') {
      setSeatDetailMode(false);
      setSelectedStairs(null);
      setOriginalCameraPosition(null);
    }
  }, [editMode]);

  useEffect(() => {
    if (managersRef.current?.manualCameraController) {
      managersRef.current.manualCameraController.setManualMode(manualCameraMode);
    }
  }, [manualCameraMode]);

  const handleGoalScoredReward = () => {
    playerDataManager.rewardGoal();
  };

  const handleStadiumCompleted = () => {
    playerDataManager.rewardStadiumCreated();
  };

  const clearStadium = () => {
    if (managersRef.current?.stadiumManager) {
      managersRef.current.stadiumManager.clearAllStadiumElements(stadiumElements);
    }
    setStadiumElements([]);
    setSelectedObject(null);
    setPreviewPosition(null);
    setPreviewRotation(0);
    setSeatDetailMode(false);
    setSelectedStairs(null);
    setOriginalCameraPosition(null);
    if (playerDataManager.stadiumManager) {
      playerDataManager.stadiumManager.clearStadium();
    }
  };

  const startGame = () => {
    setGameState('playing');
  };

  const startEditor = () => {
    setGameState('editor');
  };

  const exitSeatDetailMode = () => {
    setSeatDetailMode(false);
    setSelectedStairs(null);
    setOriginalCameraPosition(null);
    if (managersRef.current?.cameraController) {
      managersRef.current.cameraController.setDetailMode(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        zIndex: 4000
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>
            ⚡
          </div>
          <div>Načítám Firebase...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (gameState === 'menu') {
    return (
      <div style={{ position: 'relative' }}>
        <GameMenu 
          startGame={startGame} 
          startEditor={startEditor}
          startOfflineLeague={startOfflineLeague}
        />
      </div>
    );
  }

  if (gameState === 'offlineLeague') {
    return (
      <OfflineLeagueMenu
        onStartMatch={startMatchSetup}
        onBack={() => setGameState('menu')}
      />
    );
  }

  if (gameState === 'matchSetup') {
    return (
      <MatchSetupScreen
        onStartMatch={startOfflineMatch}
        onBack={() => setGameState('offlineLeague')}
        matchType="testMatch"
      />
    );
  }

  if (gameState === 'editor') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        <div 
          ref={mountRef} 
          style={{ 
            width: '100%', 
            height: '100vh', 
            backgroundColor: '#87CEEB',
            cursor: seatDetailMode ? 'copy' :
                   editMode === 'place' && placementMode ? 
                     (isValidPlacement ? 'copy' : 'not-allowed') : 
                   editMode === 'select' ? 'pointer' : 
                   editMode === 'seat' ? 'pointer' : 
                   manualCameraMode ? 'move' : 'grab'
          }} 
        />
        
        <UnsavedChangesIndicator />
        
        <StadiumEditorPanel 
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          placementMode={placementMode}
          setPlacementMode={setPlacementMode}
          editMode={editMode}
          setEditMode={setEditMode}
          selectedObject={selectedObject}
          setSelectedObject={setSelectedObject}
          seatOptions={seatOptions}
          setSeatOptions={setSeatOptions}
          clearStadium={clearStadium}
          setGameState={setGameState}
          stadiumElementsCount={stadiumElements.length}
          previewRotation={previewRotation}
          seatDetailMode={seatDetailMode}
          selectedStairs={selectedStairs}
          exitSeatDetailMode={exitSeatDetailMode}
        />
        
        <CameraControlPanel 
          manualCameraMode={manualCameraMode}
          setManualCameraMode={setManualCameraMode}
          cameraPosition={cameraPosition}
          cameraZoom={cameraZoom}
          gameState={gameState}
          userControlledCamera={getUserControlledCamera()}
          resetCameraControl={resetCameraControl}
        />
        
        <BackToMenuButton onClick={() => {
          setGameState('menu');
          setIsFirstPerson(false);
          setIsDribbling(false);
          setKickCooldown(0);
          setPlacementMode(false);
          setEditMode('place');
          setSelectedObject(null);
          setPreviewPosition(null);
          setPreviewRotation(0);
          setMouseOffsetX(0);
          setTargetCameraRotationY(0);
          setSeatDetailMode(false);
          setSelectedStairs(null);
          setOriginalCameraPosition(null);
          setManualCameraMode(false);
          setCameraPosition({ x: 0, y: 35, z: 50 });
          setCameraZoom(1.0);
          setCurrentAIOpponent(null);
        }} />
        
        {seatDetailMode ? (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            fontSize: '14px',
            maxWidth: '300px',
            border: '2px solid #4CAF50'
          }}>
            <strong style={{ color: '#4CAF50' }}>🪑 Detailní režim sedaček</strong>
            <div style={{ marginTop: '10px', lineHeight: '1.4' }}>
              <strong>🎯 Klikej na schody</strong> pro přidání sedaček<br/>
              <strong>⚙️ Nastavení:</strong> Typ, barva a režim v panelu<br/>
              <strong>🔄 Režimy:</strong><br/>
              • <span style={{ color: '#FFD700' }}>Jednotlivě</span> - po jedné sedačce<br/>
              • <span style={{ color: '#FFD700' }}>Po řadě</span> - celá řada najednou<br/>
              • <span style={{ color: '#FFD700' }}>Všechny</span> - celé schody<br/>
              <strong style={{ color: '#FF5722' }}>📤 ESC</strong> nebo tlačítko <strong>HOTOVO</strong> = zpět
            </div>
          </div>
        ) : (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '15px',
            borderRadius: '15px',
            fontSize: '12px',
            maxWidth: '320px',
            border: manualCameraMode ? '2px solid #2196F3' : '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <strong style={{ color: manualCameraMode ? '#2196F3' : '#FF9800' }}>
              💡 {manualCameraMode ? 'KAMERA AKTIVNÍ - pozice se ukládá!' : 'Nápověda'}:
            </strong>
            <div style={{ marginTop: '8px', lineHeight: '1.4' }}>
              {manualCameraMode ? (
                <>
                  <strong>📷 Ruční ovládání:</strong><br/>
                  <strong>↑↓←→</strong> - Otáčení pohledu (progresivní)<br/>
                  <strong>Kolečko/+/-</strong> - Zoom<br/>
                  <strong>R</strong> - Reset pozice a pohledu<br/>
                  <strong style={{ color: '#FF5722' }}>C</strong> - Vypnout ruční režim<br/>
                  <div style={{ fontSize: '10px', marginTop: '4px', color: '#4CAF50' }}>
                    💾 Pozice kamery se automaticky ukládá!
                  </div>
                  <div style={{ marginTop: '8px', padding: '4px', background: 'rgba(33, 150, 243, 0.2)', borderRadius: '4px' }}>
                    Zoom: {cameraZoom.toFixed(1)}x | Pos: ({cameraPosition.x.toFixed(0)}, {cameraPosition.y.toFixed(0)}, {cameraPosition.z.toFixed(0)})
                  </div>
                </>
              ) : (
                <>
                  <strong>📷 Kamera:</strong> <span style={{ color: '#4CAF50' }}>C</span> pro ruční ovládání pohledu<br/>
                  <strong>🏗️ Stavění:</strong> Vyber nástroj → Aktivuj umístění → Pohybuj myší<br/>
                  <strong>🔄 Otáčení:</strong> <span style={{ color: '#4CAF50' }}>Kolečko myši</span> nebo <span style={{ color: '#4CAF50' }}>Q/E</span> klávesy<br/>
                  <strong>🖱️ Umístění:</strong> <span style={{ color: '#4CAF50' }}>Levé tlačítko myši</span> na pozici náhledu<br/>
                  <strong>🎯 Výběr:</strong> Klikni na objekt → Použij šipky/R pro úpravy<br/>
                  <strong>🪑 Sedačky:</strong> <span style={{ color: '#FFC107' }}>Klikni na schody</span> pro detail → Přidávej sedačky<br/>
                  <strong>🚫 Zakázané:</strong> Stavění na hřišti, příliš blízko jiným objektům<br/>
                  <strong>📐 Snap:</strong> Objekty se automaticky zarovnávají k mřížce<br/>
                  <strong style={{ color: '#FFD700' }}>💰 Odměny:</strong> Dostáváš coins a EXP za stavění!<br/>
                  <strong style={{ color: '#4CAF50' }}>💾 Manuální ukládání:</strong> Ctrl+S nebo tlačítko ULOŽIT!
                </>
              )}
              {placementMode && previewPosition && !manualCameraMode && (
                <><br/><strong style={{ color: '#4CAF50' }}>✅ AKTIVNÍ:</strong> Náhled u kurzoru myši připraven</>
              )}
              {placementMode && !manualCameraMode && (
                <><br/><strong style={{ color: '#FFD700' }}>🔄 Rotace:</strong> {(previewRotation * 180 / Math.PI).toFixed(0)}°</>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100vh', 
          backgroundColor: '#87CEEB',
          cursor: isFirstPerson ? 'crosshair' : 'move'
        }} 
      />
      
      {currentAIOpponent && (
        <MatchTimer 
          aiOpponent={currentAIOpponent}
          onMatchEnd={handleMatchEnd}
        />
      )}
      
      <PlayerStatsOverlay player={playerRef.current} />
      <ShootingIndicator player={playerRef.current} />
      <GameMessageSystem />
      <BallControlIndicator player={playerRef.current} ball={ballRef.current} />
      
      {showControls && <GameControlsPanel isFirstPerson={isFirstPerson} showControls={showControls} />}
      
      <BackToMenuButton onClick={() => {
        setGameState('menu');
        setIsFirstPerson(false);
        setIsDribbling(false);
        setKickCooldown(0);
        setPlacementMode(false);
        setEditMode('place');
        setSelectedObject(null);
        setPreviewPosition(null);
        setPreviewRotation(0);
        setMouseOffsetX(0);
        setTargetCameraRotationY(0);
        setSeatDetailMode(false);
        setSelectedStairs(null);
        setOriginalCameraPosition(null);
        setManualCameraMode(false);
        setCameraPosition({ x: 0, y: 35, z: 50 });
        setCameraZoom(1.0);
        setCurrentAIOpponent(null);
        if (matchManager.isMatchRunning()) {
          matchManager.resetMatch();
        }
      }} position="top-right-offset" />
      <CameraIndicator isFirstPerson={isFirstPerson} />
      <KickCooldownIndicator kickCooldown={kickCooldown} isDribbling={isDribbling} />
      <DribblingIndicator isDribbling={isDribbling} />
      <GameStatusPanel />
      
      {currentAIOpponent && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '13px',
          fontFamily: 'Arial, sans-serif',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 999
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            🤖 {currentAIOpponent.name}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            Level {currentAIOpponent.level} • OVR {currentAIOpponent.overallRating} • {currentAIOpponent.difficulty}
          </div>
        </div>
      )}
    </div>
  );
}