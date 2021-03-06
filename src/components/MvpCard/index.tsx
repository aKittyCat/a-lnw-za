import { useContext, useState, useEffect } from 'react';
import { Map, RefreshCcw, Trash2 } from '@styled-icons/feather';
import moment from 'moment';

import { Mvp } from '../../interfaces';
import { MvpsContext } from '../../contexts/MvpsContext';
import { SettingsContext } from '../../contexts/SettingsContext';
import { MvpMapModal } from '../MvpMapModal';
import { MvpCardCountdown } from '../MvpCardCountdown';
import {
  getMvpRespawnTime,
  getMvpSprite,
  getAnimatedMvpSprite,
  respawnAt,
  respawnIn,
} from '../../utils';

import {
  Container,
  Name,
  Sprite,
  Respawn,
  MapName,
  Controls,
  Control,
  Bold,
  KilledNow,
  EditButton,
} from './styles';

interface MvpCardProps {
  mvp: Mvp;
  isActive?: boolean;
}

export function MvpCard({ mvp, isActive = false }: MvpCardProps) {
  const { killMvp, resetMvpTimer, removeMvp, openAndEditModal } =
    useContext(MvpsContext);
  const { respawnAsCountdown, animatedSprites } = useContext(SettingsContext);

  const [respawnTime, setRespawnTime] = useState<string>('');
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);

  const hasMoreThanOneMap = mvp.spawn.length > 1;
  const nextRespawn = moment(mvp.deathTime).add(getMvpRespawnTime(mvp), 'ms');

  function handleKilledNow() {
    mvp.deathMap
      ? killMvp(mvp)
      : hasMoreThanOneMap
      ? openAndEditModal(mvp)
      : killMvp({ ...mvp, deathMap: mvp.spawn[0].mapname });
  }

  useEffect(() => {
    if (!respawnAsCountdown && mvp.deathTime && mvp.deathMap) {
      setRespawnTime(respawnAt(nextRespawn));
    }
  }, [respawnAsCountdown, mvp.deathTime, mvp.deathMap, nextRespawn]);

  return (
    <Container>
      <Name>{mvp.name}</Name>
      <Sprite
        src={
          animatedSprites ? getAnimatedMvpSprite(mvp.id) : getMvpSprite(mvp.id)
        }
        alt={mvp.name}
        isAnimated={animatedSprites}
      />
      {isActive ? (
        <>
          <Respawn title={respawnTime}>
            {respawnAsCountdown ? (
              <>
                Respawn in {'\n'}
                <MvpCardCountdown nextRespawn={nextRespawn} />
              </>
            ) : (
              <>
                Respawn at {'\n'}
                <Bold>{respawnTime}</Bold>
              </>
            )}
          </Respawn>

          <MapName>
            Map:{'\n'}
            <Bold>{mvp.deathMap}</Bold>
          </MapName>

          <Controls>
            <Control onClick={() => setIsMapModalOpen(true)} title='Show map'>
              <Map color='#fff' height={17} width={17} />
            </Control>
            <Control onClick={() => resetMvpTimer(mvp)} title='Reset timer'>
              <RefreshCcw color='#fff' height={17} width={17} />
            </Control>
            <Control onClick={() => removeMvp(mvp)} title='Remove this mvp'>
              <Trash2 color='#fff' height={17} width={17} />
            </Control>
          </Controls>
        </>
      ) : (
        <Controls isActive={!isActive}>
          <KilledNow onClick={handleKilledNow}>I killed now !</KilledNow>
          <EditButton onClick={() => openAndEditModal(mvp)}>Edit</EditButton>
        </Controls>
      )}

      {mvp.deathMap && isMapModalOpen && (
        <MvpMapModal
          deathMap={mvp.deathMap}
          deathPosition={mvp.deathPosition}
          close={() => setIsMapModalOpen(false)}
        />
      )}
    </Container>
  );
}
