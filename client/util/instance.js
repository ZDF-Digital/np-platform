import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TopBar } from '../organizer/TopBar';
import { IBMPlexSans_400Regular, IBMPlexSans_500Medium, IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import { LoginScreen } from '../organizer/Login';
import { Datastore, WaitForData, useGlobalProperty, useLoaded } from '../util/datastore';
import { useFonts } from 'expo-font';
import { Catcher } from '../component/catcher';
import { structures } from '../structure';
import { assembleConfig, assembleScreenSet } from './features';
import { useFirebaseData } from './firebase';
import { useIsAdminForSilo } from '../component/admin';

export function useStandardFonts() {
    let [fontsLoaded] = useFonts({
        IBMPlexSans_400Regular,
        IBMPlexSans_500Medium,
        IBMPlexSans_600SemiBold,
        IBMPlexMono_400Regular,
        IBMPlexMono_500Medium,
        IBMPlexMono_600SemiBold
    });
    return fontsLoaded
}

export function ScreenStack({url, screenStack, siloKey, structureKey, instanceKey}) {
    const s = ScreenStackStyle;
    
    const structure = getStructureForKey(structureKey);
    const language = useFirebaseData(['silo', siloKey, 'module-public', 'language'])
    const activeFeatures = useFirebaseData(['silo', siloKey, 'structure', structureKey, 'instance', instanceKey, 'global', 'features']) || [];
    const config = assembleConfig({structure, activeFeatures});
    const screenSet = assembleScreenSet({structure, activeFeatures});
    const isAdmin = useIsAdminForSilo({siloKey});

    if (!structureKey || !instanceKey || !siloKey) {
        console.error('ScreenStack missing keys', {structureKey, instanceKey, siloKey});
    }
 
    return <View style={s.stackHolder}>
        <Datastore key={url} siloKey={siloKey} instanceKey={instanceKey} structureKey={structureKey} 
                language={language} isAdmin={isAdmin} isLive={true} config={config} >
            {screenStack.map((screenInstance, index) => 
                <StackedScreen screenSet={screenSet} screenInstance={screenInstance} index={index} key={index} />
            )}
        </Datastore>
    </View>
}
  
const ScreenStackStyle = StyleSheet.create({
    stackHolder: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'white',
    }
})
  


export function StackedScreen({screenSet, screenInstance, index, features}) {
    const {structureKey, instanceKey, screenKey, params} = screenInstance;
    const loaded = useLoaded();

    if (structureKey == 'login' || instanceKey == 'login' || screenKey == 'login') {
        return <FullScreen zIndex={index}>
            <TopBar title='Log In' />
            <LoginScreen {...params} />
        </FullScreen>
    }  

    const structure = getStructureForKey(structureKey);
    var screen = getScreen({screenSet, structure, screenKey, instanceKey});
    var title = getScreenTitle({screenSet, structure, screenKey, params}); 
    const showTopBar = screenKey != 'teaser';
  
    if (!screen) {
        if (loaded) { // Don't show this error waiting for screen set to resolve
            console.error('Screen not found', {loaded, screenSet, structure: structure, screenKey, instanceKey, screen});
        }
        return null;
    }

    return <FullScreen zIndex={index}>
        {showTopBar && <TopBar title={title} index={index} params={params} subtitle={structure.name} />}
        <WaitForData>
            <Catcher>
                {React.createElement(screen, params)}
            </Catcher>
        </WaitForData>
    </FullScreen>  
  }  

function getScreen({screenSet, structure, screenKey}) {
    if (!screenKey) {
        return structure.screen;
    } else if (screenKey == 'teaser') {
        return structure.teaser;
    } else {
        return screenSet[screenKey];
    }
}
  
function getScreenTitle({screenSet, structure, screenKey, params}) {
    const name = useGlobalProperty('name');
    if (screenKey) {
        const title = screenSet?.[screenKey]?.title;
        if (typeof(title) == 'string') {
            return title;
        } else if (title) {
            return React.createElement(title, params);
        } else {
            return null;
        }
    } else if (name) {
        return name;
    } else {
        return structure.name
    }
}
  
function FullScreen({children, zIndex=0, backgroundColor='white'}) {
    const s = FullScreenStyle;
    return <View style={[s.fullScreen, {zIndex, backgroundColor}]}>{children}</View>
}

const FullScreenStyle = StyleSheet.create({
    fullScreen: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
    }
})
  
  
export function getStructureForKey(key) {
    if (!key) return null;
    return structures.find(structure => structure.key === key);
}
  
function chooseInstanceByKey({structure, instanceKey}) {
    return {isLive: true}
}
  
  