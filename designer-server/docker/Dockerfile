FROM ubuntu:latest

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

ARG SSH_USER_NAME
ARG SSH_USER_PASSWORD
ARG HOSTNAME
ARG TIMEZONE
ARG HA_TOKEN

RUN if [ -z "$SSH_USER_NAME" ]; then \
    echo "Error: SSH_USER_NAME must be defined!" && exit 1; \
    fi

RUN if [ -z "$SSH_USER_PASSWORD" ]; then \
    echo "Error: SSH_USER_PASSWORD must be defined!" && exit 1; \
    fi

RUN if [ -z "$HOSTNAME" ]; then \
    echo "Error: HOSTNAME must be defined!" && exit 1; \
    fi

RUN if [ -z "$TIMEZONE" ]; then \
    echo "Error: TIMEZONE must be defined!" && exit 1; \
    fi

RUN if [ -z "$HA_TOKEN" ]; then \
    echo "Error: HA_TOKEN must be defined!" && exit 1; \
    fi

# Install packages
RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y \
    sudo \
    syslog-ng \
    nano \
    tzdata \
    cron \
    openssh-server \
    nginx \
    curl \
    ca-certificates \
    gnupg \
    git \
    python3 \
    python3-pip \
    python3.12-venv

# Install Node.js 22 and npm via NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    node -v && npm -v

# Cleanup package lists
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 8999

# Create the SSH user and set a password
RUN useradd -m -s /bin/bash $SSH_USER_NAME && echo "$SSH_USER_NAME:$SSH_USER_PASSWORD" | chpasswd

# Add the SSH user to the sudo group
RUN usermod -aG sudo $SSH_USER_NAME

# Create SSH run file directory
RUN mkdir /var/run/sshd 

# Exclude core messages in docker cotnainer
RUN sudo sed -i 's/system()/system(exclude-kmsg(yes))/g' /etc/syslog-ng/syslog-ng.conf

# Set timezone
RUN  ln -fs /usr/share/zoneinfo/$TIMEZONE /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

# Create repos director
RUN export SAVE_PWD=$(pwd) && \
    mkdir /home/${SSH_USER_NAME}/repos && \
    git clone https://github.com/mekatrol/home-assistant-dashboards.git /home/${SSH_USER_NAME}/repos/home-assistant-dashboards && \
    cd /home/${SSH_USER_NAME}/repos/home-assistant-dashboards/designer-ui && \
    npm i && npm run build && \
    cd /home/${SSH_USER_NAME}/repos/home-assistant-dashboards/designer-server && \
    python3 -m venv venv && \
    ./venv/bin/pip install -r requirements.txt && \
    chown -R ${SSH_USER_NAME}:${SSH_USER_NAME} /home/${SSH_USER_NAME}/repos && \
    cd $SAVE_PWD

# Replace the placeholder in config.yaml
RUN sed -i "s|replace text with home assistant long lived token here|${HA_TOKEN}|" /home/${SSH_USER_NAME}/repos/home-assistant-dashboards/designer-server/config/config.yaml

# Create run app script
RUN echo "#!/bin/bash\n\
    cd /home/${SSH_USER_NAME}/repos/home-assistant-dashboards/designer-server\n \
    . venv/bin/activate\n \
    flask --app app.py run --host=0.0.0.0 --port=8000 &\n" > /server.sh && chmod +x /server.sh

# Create start up script
RUN echo "#!/bin/bash\n\
    sudo service syslog-ng start\n\
    sudo service ssh start\n\
    /server.sh &\
    tail -f /var/log/syslog" > /start.sh && chmod +x /start.sh

# Run container start up script
CMD ["/bin/bash", "/start.sh"]