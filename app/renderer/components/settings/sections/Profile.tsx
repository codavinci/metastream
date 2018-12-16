import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styles from '../SettingsMenu.css'
import { TextInput } from 'renderer/components/common/input'
import { IAppState } from 'renderer/reducers/index'
import { getLocalUsername, getLocalColor, getLocalAvatar } from 'renderer/reducers/settings'
import { USERNAME_MAX_LEN } from 'constants/settings'
import { setUsername, setColor, setSetting } from 'renderer/actions/settings'
import { t } from '../../../../locale/index'
import { avatarRegistry } from '../../../services/avatar'
import { UserAvatar } from '../../lobby/UserAvatar'
import { ExternalLink } from 'renderer/components/common/link'
import { Trans } from 'react-i18next'

interface IProps {}

interface IConnectedProps {
  avatar?: string
  username: string
  color: string
}

type Props = IProps & IConnectedProps & DispatchProp<{}>

class ProfileSettings extends Component<Props> {
  private usernameInput: HTMLInputElement | null = null

  private get username() {
    return this.usernameInput && this.usernameInput.value
  }

  private get selectedAvatar() {
    const { avatar } = this.props
    return avatar ? avatarRegistry.getByURI(avatar) : null
  }

  render(): JSX.Element | null {
    const { selectedAvatar } = this
    const hasArtist = selectedAvatar ? !!selectedAvatar.artist : false
    return (
      <section className={styles.section}>
        <h2>{t('profile')}</h2>

        <label>{t('avatar')}</label>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarList}>
            {avatarRegistry.getAll().map((avatar, idx) => (
              <UserAvatar
                key={idx}
                avatar={avatar.src}
                selected={avatar.uri === this.props.avatar}
                onClick={() => {
                  this.props.dispatch!(setSetting('avatar', avatar.uri))
                }}
              />
            ))}
          </div>
          {hasArtist && (
            <div className={styles.avatarDesc}>
              {/* prettier-ignore */}
              <Trans i18nKey="avatarCredit" values={{ artist: selectedAvatar!.artist }}>
                <span className={styles.blend}>Selected avatar art by</span>
                {selectedAvatar!.href ? (
                  <ExternalLink href={selectedAvatar!.href!} className="link-alt">Unknown</ExternalLink>
                ) : (
                  <span className={styles.blend}>Unknown</span>
                )}
              </Trans>
            </div>
          )}
        </div>

        <label htmlFor="profile_username">{t('username')}</label>
        <TextInput
          id="profile_username"
          theRef={e => (this.usernameInput = e)}
          defaultValue={this.props.username}
          maxLength={USERNAME_MAX_LEN}
          onChange={this.onChangeUsername}
          onBlur={e => {
            if (this.usernameInput) {
              this.usernameInput.value = this.props.username
            }
          }}
        />

        <label htmlFor="profile_color">{t('chatColor')}</label>
        <input
          id="profile_color"
          type="color"
          className={styles.colorSwatch}
          defaultValue={this.props.color}
          onChange={e => this.props.dispatch!(setColor(e.target!.value))}
        />
      </section>
    )
  }

  // TODO: debounce
  private onChangeUsername = () => {
    const { username } = this
    if (!username) return

    if (username !== this.props.username) {
      this.props.dispatch!(setUsername(username))
    }
  }
}

export default connect(
  (state: IAppState): IConnectedProps => {
    return {
      avatar: getLocalAvatar(state),
      username: getLocalUsername(state),
      color: getLocalColor(state)
    }
  }
)(ProfileSettings) as React.ComponentClass<IProps>
